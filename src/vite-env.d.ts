/// <reference types="vite/client" />

declare module '*.mml?raw' {
  const content: string;
  export default content;
}
