import { useEffect } from "react";

function useAutoResizeIframe() {
  useEffect(() => {
    const sendHeight = () => {
      const height = document.body.scrollHeight;
      window.parent.postMessage({ type: "setHeight", height }, "*");
    };

    sendHeight();
    window.addEventListener("resize", sendHeight);
    return () => window.removeEventListener("resize", sendHeight);
  }, []);
}

export default useAutoResizeIframe;
