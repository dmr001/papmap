<template>
  <div id="thumbnail">
    <div id="viewer" class="pdfViewer">

    </div>
  </div>
</template>

<script>

// import * as pdfjs from "pdfjs-dist"
import pdfjs from "@bundled-es-modules/pdfjs-dist/build/pdf";
// pdfjs.GlobalWorkerOptions.workerSrc =
//     "@bundled-es-modules/pdfjs-dist/pdf.worker.js";

// import { PDFViewer } from "pdfjs-dist/web/pdf_viewer"
// import "pdfjs-dist/web/pdf_viewer.css"

// pdfjs.GlobalWorkerOptions.workerSrc = 'lib/pdf.worker.js';

// pdfjs.GlobalWorkerOptions.workerSrc =
//     "https://cdn.jsdelivr.net/npm/pdfjs-dist@2.0.943/build/pdf.worker.min.js";

// if (!pdfjs.workerSrc) {
//   pdfjs.GlobalWorkerOptions.workerSrc = 'lib/pdf.worker.js';
//   pdfjs.workerSrc = 'lib/pdf.worker.js';
//
//   console.log(`PDFjs workersrc reset to = ${pdfjs.workerSrc}`);
//
// }

export default {
  name: "Thumbnail",
  data () {
    return {
    }
  },
  mounted () {
    this.getPdf();
  },
  props: {
    filename: String,
    url: String
  },
  methods: {
    async getPdf() {
      if (!pdfjs.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = 'lib/pdf.worker.js';
        pdfjs.workerSrc = 'lib/pdf.worker.js';

        // pdfjs.GlobalWorkerOptions.workerSrc =
        //     "bundled-es-modules/pdfjs-dist/pdf.worker.js";
        // pdfjs.workerSrc = "bundled-es-modules/pdfjs-dist/pdf.worker.js";
        console.log(`PDFjs workersrc reset to = ${pdfjs.workerSrc}`);

      }
      console.log(`PDFjs worker: ${pdfjs.workerSrc}`);

      console.log(`Getting PDF from ${this.url}`)
      let canvas = document.getElementById("thumbnail");
      // let pdfViewer = new PDFViewer({container: container});

      // pdfjs.disableWorker = true;
      const loadingTask = pdfjs.getDocument(this.url);
      const pdf = await loadingTask.promise;
      pdf.getPage(1).then(function(page) {
        const scale = 1.0;
        let viewport = page.getViewport({scale: scale});
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const context = canvas.getContext('2d');

        let renderContext = {
          canvasContext: context,
          viewport: viewport
        }

        let renderTask = page.render(renderContext);
        renderTask.promise.then(function () {
          console.log("Page rendered")
        });
      });
      // pdfViewer.setDocument(pdf);

    }
  }
}
</script>

<style scoped>
#thumbnail {
  margin: 0 auto;
  width: 100%
}

.pdf-thumbnail {
  cursor: pointer;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: relative;
  width: 100%;
}

</style>
