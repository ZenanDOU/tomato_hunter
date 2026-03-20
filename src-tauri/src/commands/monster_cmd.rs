use crate::monster_gen;
use serde::Deserialize;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GenerateMonsterParams {
    pub category: String,
    pub task_name: String,
    pub task_description: String,
    pub difficulty: Option<String>,
    pub api_key: Option<String>,
}

#[tauri::command]
pub async fn generate_monster(
    params: GenerateMonsterParams,
) -> Result<monster_gen::MonsterInfo, String> {
    // Try AI generation if API key provided
    if let Some(key) = &params.api_key {
        if !key.is_empty() {
            match generate_with_ai(key, &params).await {
                Ok(info) => return Ok(info),
                Err(_) => {} // Fall through to offline
            }
        }
    }

    // Offline fallback
    let difficulty = params.difficulty.as_deref().unwrap_or("simple");
    Ok(monster_gen::generate_offline(
        &params.category,
        &params.task_name,
        difficulty,
    ))
}

async fn generate_with_ai(
    api_key: &str,
    params: &GenerateMonsterParams,
) -> Result<monster_gen::MonsterInfo, String> {
    let client = reqwest::Client::new();
    let species_hint = match params.category.as_str() {
        "work" => "齿轮兽、报表蛙、会议蟒、邮件鸦、加班狼",
        "study" => "书卷龙、考试虎、笔记蝶、公式蛇、论文狼",
        "creative" => "墨灵、灵感蝶、画布蛇、脑洞猫、设计鹰",
        "life" => "绿藤怪、收纳蛙、采购鹿、打扫蜂、做饭熊",
        _ => "影魔、混沌虫、迷雾鸦、拖延龙、虚空鱼",
    };
    let prompt = format!(
        "你是番茄农场的世界观设计师。番茄农场被拖延怪物入侵了！\n\n\
        任务名称：{}，分类：{}，描述：{}\n\n\
        可选种族：{}\n\n\
        请为这个任务生成一只拖延怪物。要求：\n\
        - 名字格式：\"拖延形容词·任务关键词+种族后缀\"（如任务\"写报告\"→\"拖延的·报告蟒\"）\n\
        - 名字必须包含任务内容的关键词，让用户一看就知道这个怪物代表什么任务\n\
        - 描述要包含任务内容和怪物如何囚禁番茄\n\n\
        请只用JSON格式回复：{{\"name\": \"怪物名\", \"description\": \"一两句战斗描述\"}}",
        params.task_name, params.category, params.task_description, species_hint
    );

    let resp = client
        .post("https://api.anthropic.com/v1/messages")
        .header("x-api-key", api_key)
        .header("anthropic-version", "2023-06-01")
        .header("content-type", "application/json")
        .json(&serde_json::json!({
            "model": "claude-haiku-4-5-20251001",
            "max_tokens": 200,
            "messages": [{"role": "user", "content": prompt}]
        }))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let body: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;
    let text = body["content"][0]["text"].as_str().unwrap_or("{}");

    if let Ok(info) = serde_json::from_str::<serde_json::Value>(text) {
        Ok(monster_gen::MonsterInfo {
            name: info["name"]
                .as_str()
                .unwrap_or("神秘拖延怪")
                .to_string(),
            description: info["description"]
                .as_str()
                .unwrap_or("一只从虚空降临的拖延怪物，正在囚禁农场的番茄")
                .to_string(),
            variant: "normal".to_string(),
        })
    } else {
        Err("Failed to parse AI response".to_string())
    }
}
