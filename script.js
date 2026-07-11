(function () {
  var params = new URLSearchParams(location.search);
  if (!params.has("edit")) return;

  document.body.classList.add("edit-mode");

  var field = document.querySelector(".blob-field");
  var blobs = Array.prototype.slice.call(document.querySelectorAll(".blob"));

  var panel = document.createElement("div");
  panel.className = "blob-editor-panel";
  panel.innerHTML =
    "<strong>Edit mode</strong><br>Drag a blob to move it, drag its corner handle to resize.<br>" +
    '<pre id="blob-markup"></pre>' +
    '<button id="blob-copy">Copy markup</button>';
  document.body.appendChild(panel);

  var pre = panel.querySelector("#blob-markup");
  panel.querySelector("#blob-copy").addEventListener("click", function () {
    navigator.clipboard.writeText(buildMarkup());
  });

  function buildMarkup() {
    var lines = blobs.map(function (blob) {
      var classes = blob.className.trim();
      var style =
        "top: " + blob.style.top + "; left: " + blob.style.left +
        "; width: " + blob.style.width + "; height: " + blob.style.height + ";";
      return '    <span class="' + classes + '" style="' + style + '"></span>';
    });
    return '<div class="blob-field" aria-hidden="true">\n' + lines.join("\n") + "\n  </div>";
  }

  function updatePanel() {
    pre.textContent = buildMarkup();
  }

  blobs.forEach(function (blob) {
    var handle = document.createElement("span");
    handle.className = "blob-resize-handle";
    blob.appendChild(handle);

    var drag = null;

    blob.addEventListener("pointerdown", function (e) {
      if (e.target === handle) return;
      e.preventDefault();
      var rect = blob.getBoundingClientRect();
      drag = { type: "move", offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
      blob.setPointerCapture(e.pointerId);
    });

    handle.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var rect = blob.getBoundingClientRect();
      drag = {
        type: "resize",
        startWidth: rect.width,
        startHeight: rect.height,
        startX: e.clientX,
        startY: e.clientY
      };
      blob.setPointerCapture(e.pointerId);
    });

    blob.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var fr = field.getBoundingClientRect();

      if (drag.type === "move") {
        var left = e.clientX - fr.left - drag.offsetX;
        var top = e.clientY - fr.top - drag.offsetY;
        blob.style.left = ((left / fr.width) * 100).toFixed(2) + "%";
        blob.style.top = ((top / fr.height) * 100).toFixed(2) + "%";
      } else {
        var w = Math.max(60, drag.startWidth + (e.clientX - drag.startX));
        var h = Math.max(60, drag.startHeight + (e.clientY - drag.startY));
        blob.style.width = Math.round(w) + "px";
        blob.style.height = Math.round(h) + "px";
      }
      updatePanel();
    });

    ["pointerup", "pointercancel"].forEach(function (evt) {
      blob.addEventListener(evt, function () {
        drag = null;
      });
    });
  });

  updatePanel();
})();
