    <div id="iframe-container">
      <iframe
        id="react-iframe"
        src="/wp-content/uploads/react-offer-form/index.html" width="100%"
        style="border:0;">
      </iframe>
    </div>

    <script>
      const iframe = document.getElementById("react-iframe");

      window.addEventListener("message", (event) => {
          const offset = Number(event.data.height)+10
        if (event.data.type === "setHeight") {
          iframe.style.height = offset + "px";
        }
      });
    </script>
