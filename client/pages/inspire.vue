<template>
  <div >
    <div>
      <h1>asdasdasd</h1>
      <p>asdasdasd</p>
      <img id="contenido" src="/v.png" alt />
      <h1>asdasd</h1>
    </div>
    <v-layout>
      <v-flex class="text-center">
        <img src="/v.png" alt="Vuetify.js" class="mb-5" />
        <blockquote class="blockquote">
          &#8220;First, solve the problem. Then, write the code.&#8221;
          <footer>
            <small>
              <em>&mdash;John Johnson</em>
            </small>
          </footer>
        </blockquote>
      </v-flex>
    </v-layout>

    <v-btn @click="exportToPDF()"></v-btn>
  </div>
</template>
<script>
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default {
  data: () => ({}),
  mounted() {},
  methods: {
    exportToPDF() {
      const doc = new jsPDF();
      /** WITH CSS */
      var canvasElement = document.createElement("canvas");
      let contenido = document.getElementById("contenido");
      window.scrollTo(0, 0);
      html2canvas(contenido).then(function(canvas) {
        const img = canvas.toDataURL("image/jpeg");
        
        doc.line(10, 10, 200, 10);
        doc.line(10, 30, 200, 30);
        doc.line(10, 10, 10, 30);
        doc.line(70, 10, 70, 30);
        doc.line(140, 10, 140, 30);
        doc.line(200, 10, 200, 30);
        doc.text("Reporte", 95, 20);

        doc.line(10, 35, 130, 35);
        
        doc.setFontSize(10);
        doc.text("fecha : ", 170, 14);
        
        doc.text("codigo :", 12 , 39)
        doc.line(10, 50, 130, 50);
        
        doc.text("Serie :", 12 , 44)
        doc.line(10, 40, 130, 40);
        
        doc.text("Programacion :", 12 , 49)
        doc.line(10, 45, 130, 45);
        
        doc.line(10, 50, 10, 35);
        doc.line(130, 50, 130, 35);

        doc.line(36, 50, 36, 35);

        doc.text("*****", 37 , 39)
        doc.text("******", 37 , 44)
        doc.text("*****", 37 , 49)
        
        doc.line(50, 50, 50, 35);
        
        doc.text("Cant. Lote:", 51 , 39)
        doc.text("Inicio :", 51 , 44)
        doc.text("Final :", 51 , 49)
        
        doc.line(70, 50, 70, 35);
        
        doc.text("******", 71 , 39)
        doc.text("*******", 71 , 44)
        doc.text("*******", 71 , 49)

        doc.line(90, 50, 90, 35);
        
        doc.text("Maquina :", 91 , 39)
        doc.text("Operador", 91, 44)
        doc.text("No de Muestra:", 91 , 49)
        
        doc.line(116, 50, 116, 35);
        
        
        doc.text("////// :", 117 , 39)
        doc.text("/////", 117, 44)
        doc.text("/////:", 117 , 49)
        doc.addImage(img, "JPEG", 20, 60);
        doc.save("sample.pdf");
      });
    }
  }
};
</script>
