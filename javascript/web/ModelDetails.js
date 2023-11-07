document.addEventListener('DOMContentLoaded', function () {
  customElements.whenDefined('wc-gocam-viz').then(function () {
    const model = JSON.parse(document.getElementById("gocam-data").text);
    const vizElement = document.getElementById("gocam-1");
    vizElement.setModelData(model);
  });
});
