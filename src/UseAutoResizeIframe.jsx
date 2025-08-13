import { useEffect } from "react";

function useAutoResizeIframe() {
  useEffect(() => {
    const sendHeight = () => {
      const height = document.body.scrollHeight;
      window.parent.postMessage({ type: "setHeight", height }, "*");
    };

    // Initiale Höhe senden
    sendHeight();

    // Resize-Event für Fenster
    window.addEventListener("resize", sendHeight);

    // MutationObserver für DOM-Änderungen
    const observer = new MutationObserver(sendHeight);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      window.removeEventListener("resize", sendHeight);
      observer.disconnect();
    };
  }, []);
}

export default useAutoResizeIframe;
