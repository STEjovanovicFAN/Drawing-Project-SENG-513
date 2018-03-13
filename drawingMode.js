
var canvas;

$(function(){
  canvas = window._canvas = new fabric.Canvas('canvas');
  canvas.isDrawingMode=1;
  canvas.freeDrawingBrush.color = "purple";
  canvas.freeDrawingBrush.width = 10;
  canvas.renderAll();


});
