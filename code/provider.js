async function scheduleHtmlProvider(
  iframeContent = "",
  frameContent = "",
  dom = document
) {
  let iframe = dom.getElementsByTagName("iframe")[0].contentDocument;
  let xfyq_area = iframe.getElementsByClassName("xfyq_area mt10");
  let table;
  if (xfyq_area.length == 0) {
    table = dom.getElementsByClassName("xfyq_area mt10")[0].outerHTML;
  } else {
    table = xfyq_area[0].outerHTML;
  }
  // console.info(table)
  return table;
}
