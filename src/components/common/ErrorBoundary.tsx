import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { error, showDetails } = this.state;
    const title = this.props.fallbackTitle ?? "Something went wrong...";

    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: "#55BBEE" }}
      >
        <div
          className="flex flex-col items-center gap-4 p-8 max-w-md w-full outline-2 outline-offset-[-2px] shadow-[4px_4px_0_0_rgba(0,0,0,0.25)]"
          style={{
            backgroundColor: "#FFFFFF",
            outlineColor: "#333333",
          }}
        >
          {/* Pixel skull icon */}
          <div
            className="text-4xl select-none leading-none"
            style={{ color: "#EE4433" }}
          >
            {"\u2620"}
          </div>

          <h1
            className="text-xl font-bold text-center"
            style={{ color: "#333333" }}
          >
            {title}
          </h1>

          <p className="text-sm text-center" style={{ color: "#333333" }}>
            {error?.message ?? "An unexpected error occurred."}
          </p>

          {/* Reload button — mirrors PixelButton "cta" style */}
          <button
            onClick={this.handleReload}
            className="rounded-none outline-2 outline-pixel-black outline-offset-[-2px] shadow-[2px_2px_0_0_rgba(0,0,0,0.25)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-none cursor-pointer px-6 py-3 text-base font-bold text-white"
            style={{ backgroundColor: "#EE4433" }}
          >
            Reload
          </button>

          {/* Expandable error details */}
          <button
            onClick={this.toggleDetails}
            className="text-xs underline cursor-pointer bg-transparent border-none"
            style={{ color: "#333333" }}
          >
            {showDetails ? "Hide details" : "Show details"}
          </button>

          {showDetails && error && (
            <pre
              className="w-full max-h-48 overflow-auto text-xs p-3 outline-2 outline-offset-[-2px] whitespace-pre-wrap break-words"
              style={{
                backgroundColor: "#F5F5F5",
                color: "#333333",
                outlineColor: "#333333",
              }}
            >
              {error.stack ?? error.message}
            </pre>
          )}
        </div>
      </div>
    );
  }
}
