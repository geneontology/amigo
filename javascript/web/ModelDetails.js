document.addEventListener('DOMContentLoaded', function () {
  customElements.whenDefined('go-gocam-viewer').then(function () {
    const model = JSON.parse(document.getElementById("gocam-data").text);
    const viewerEl = document.getElementById("gocam-1");
    viewerEl.setModelData(model);
  });
});
