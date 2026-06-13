import PhotoSwipeLightbox from "./photoswipe/photoswipe-lightbox.esm.js";
import PhotoSwipe from "./photoswipe/photoswipe.esm.js";
import PhotoSwipeDynamicCaption from "./photoswipe/photoswipe-dynamic-caption-plugin.esm.min.js";
import * as params from "@params";

const gallery = document.getElementById("gallery");

if (gallery) {
  const lightbox = new PhotoSwipeLightbox({
    gallery,
    children: ".gallery-item",
    showHideAnimationType: "zoom",
    bgOpacity: 1,
    pswpModule: PhotoSwipe,
    imageClickAction: "zoom",
    closeTitle: params.closeTitle,
    zoomTitle: params.zoomTitle,
    arrowPrevTitle: params.arrowPrevTitle,
    arrowNextTitle: params.arrowNextTitle,
    errorMsg: params.errorMsg,
  });

  lightbox.on("uiRegister", () => {
    lightbox.pswp.ui.registerElement({
      name: "fullscreen-button",
      order: 15,
      isButton: true,
      html: {
        isCustomSVG: true,
        inner: '<path d="M4 4H13V7H7V13H4ZM28 4H19V7H25V13H28ZM28 28H19V25H25V19H28ZM4 28H13V25H7V19H4Z" id="pswp__icn-fullscreen-enter"/><path hidden id="pswp__icn-fullscreen-exit" d="M4 10H10V4H13V13H4ZM28 10H22V4H19V13H28ZM28 22H22V28H19V19H28ZM4 22H10V28H13V19H4Z"/>',
        outlineID: "pswp__icn-fullscreen-enter",
      },
      title: "Toggle fullscreen",
      onInit: (el, pswp) => {
        const enterIcon = el.querySelector("#pswp__icn-fullscreen-enter");
        const exitIcon = el.querySelector("#pswp__icn-fullscreen-exit");
        const updateIcon = () => {
          const isFullscreen = !!document.fullscreenElement;
          enterIcon.hidden = isFullscreen;
          exitIcon.hidden = !isFullscreen;
        };
        document.addEventListener("fullscreenchange", updateIcon);
        pswp.on("close", () => document.removeEventListener("fullscreenchange", updateIcon));
        el.addEventListener("click", () => {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            document.documentElement.requestFullscreen();
          }
        });
      },
    });
  });

  if (params.enableDownload) {
    lightbox.on("uiRegister", () => {
      lightbox.pswp.ui.registerElement({
        name: "download-button",
        order: 8,
        isButton: true,
        tagName: "a",
        html: {
          isCustomSVG: true,
          inner: '<path d="M20.5 14.3 17.1 18V10h-2.2v7.9l-3.4-3.6L10 16l6 6.1 6-6.1ZM23 23H9v2h14Z" id="pswp__icn-download"/>',
          outlineID: "pswp__icn-download",
        },
        onInit: (el, pswp) => {
          el.setAttribute("download", "");
          el.setAttribute("target", "_blank");
          el.setAttribute("rel", "noopener");
          el.setAttribute("title", params.downloadTitle || "Download");
          pswp.on("change", () => {
            el.href = pswp.currSlide.data.element.href;
          });
        },
      });
    });
  }

  lightbox.on("change", () => {
    const target = lightbox.pswp.currSlide?.data?.element?.dataset["pswpTarget"];
    history.replaceState("", document.title, "#" + target);
  });

  lightbox.on("close", () => {
    history.replaceState("", document.title, window.location.pathname);
  });

  new PhotoSwipeDynamicCaption(lightbox, {
    mobileLayoutBreakpoint: 700,
    type: "auto",
    mobileCaptionOverlapRatio: 1,
    captionContent: (slide) => {
      const el = slide.data.element;
      const title = el.title;
      const meta = [el.dataset.captionCamera, el.dataset.captionFilm, el.dataset.captionLens].filter(Boolean);
      return (title ? `<p><strong>${title}</strong></p>` : "") + meta.map((line) => `<p>${line}</p>`).join("");
    },
  });

  lightbox.init();

  if (window.location.hash.substring(1).length > 1) {
    const target = window.location.hash.substring(1);
    const items = gallery.querySelectorAll("a");
    for (let i = 0; i < items.length; i++) {
      if (items[i].dataset["pswpTarget"] === target) {
        lightbox.loadAndOpen(i, { gallery });
        break;
      }
    }
  }
}
