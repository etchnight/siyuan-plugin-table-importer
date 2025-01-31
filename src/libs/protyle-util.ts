/**
 * 参考自带的模板选择窗口：app\src\protyle\toolbar\index.ts
 * todo 尺寸计算
 */

import { Dialog, IProtyle } from "siyuan";
import { getI18n, ISnippet } from "./common";
import { execCopy, previewCopy } from "./customCopy";
import { execUpdate, previewUpdate } from "./customUpdate";
import { execPaste, previewPaste } from "./customPaste";
import { EComponent } from "./constants";
import { processRender } from "../../subMod/siyuanPlugin-common/src/render";
import { store } from "./store";
export const protyleUtil = (
  files: ISnippet[],
  blockElements: HTMLElement[],
  protyle: IProtyle,
  dialog: Dialog,
  component: EComponent
) => {
  /**
   * root
   * - protyle-util
   *  - fn__flex(utilContiainer)
   *    - fn__flex-column(leftContiainer)
   *      - fn__flex(tools)
   *        - input
   *        - previous//todo
   *        - next//todo
   *      - b3-list
   *        - b3-list-item
   *    - div(descriptionContiainer)description
   *      - Refresh（重新运行）
   *      - protyle-wysiwyg
   *    - div(previewContiainer)
   *      - protyle-wysiwyg
   */

  /**尺寸计算 */
  const compuleteSize = () => {
    const height = window.innerHeight * 0.78; //比容器css设定的80vw略小
    const width = window.innerWidth * 0.8;
    const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const size = {
      left: center.x - width / 2 + "px",
      top: center.y - height / 2 + "px",
      width: width + "px",
      height: height + "px",
      leftWidth: width * 0.25 + "px",
      midWidth: width * 0.25 + "px",
      rightWidth: width * 0.5 + "px",
    };
    return size;
  };
  const size = compuleteSize();

  //根节点
  const root = document.createElement("div");
  const protyleUtil = document.createElement("div");
  protyleUtil.classList.add("protyle-util");
  protyleUtil.style.top = size.top; //"65.1125px";
  protyleUtil.style.left = size.left; //"288.8px";
  protyleUtil.style.zIndex = "11";
  //protyleUtil.style.position = "absolute";
  root.appendChild(protyleUtil);

  //容器
  const utilContiainer = document.createElement("div");
  utilContiainer.classList.add("fn__flex");
  utilContiainer.style.maxHeight = size.height; //"372.8px";
  protyleUtil.appendChild(utilContiainer);

  //左侧
  const leftContiainer = document.createElement("div");
  leftContiainer.classList.add("fn__flex-column");
  //leftContiainer.style.width = "260px";
  leftContiainer.style.maxWidth = size.leftWidth; //"50vw";
  utilContiainer.appendChild(leftContiainer);

  //*工具栏（左上）
  const tools = document.createElement("div");
  tools.classList.add("fn__flex");
  tools.style.margin = "0 8px 4px 8px";
  leftContiainer.appendChild(tools);

  const input = document.createElement("input");
  input.classList.add("b3-text-field");
  input.classList.add("fn__flex-1");
  input.oninput = (e) => {
    updateList((e.target as HTMLInputElement).value);
  };
  tools.appendChild(input);
  //todo
  /*   const previous = document.createElement("span");
          previous.classList.add("block__icon");
          previous.classList.add("block__icon--show");
          previous.setAttribute("data-type", "previous");
          previous.innerHTML = `<svg><use xlink:href="#iconLeft"></use></svg>`;
          tools.appendChild(previous);
          const next = document.createElement("span");
          next.classList.add("block__icon");
          next.classList.add("block__icon--show");
          next.setAttribute("data-type", "next");
          next.innerHTML = `<svg><use xlink:href="#iconRight"></use></svg>`;
          tools.appendChild(next); */

  //*私有状态，用于记录当前选中的文件
  let selectedFile: ISnippet | undefined;
  let lastFile: ISnippet | undefined; //*不会清空
  //*列表项
  const buildListItem = (file: ISnippet) => {
    const listItem = document.createElement("div");
    listItem.classList.add("b3-list-item");
    listItem.classList.add("b3-list-item--hide-action");
    //*运行脚本（预览）
    listItem.addEventListener("mouseenter", async () => {
      selectedFile = file;
      lastFile = file;
      //*防抖
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve("");
        }, 500);
      });
      if (selectedFile !== file) {
        return;
      }
      //*描述
      const updateDescription = async (file: ISnippet) => {
        await updateWysiwyg("", wysiwygDescription);
        //await getComment(file);
        if (file.description) {
          await updateWysiwyg(
            protyle.lute.Md2BlockDOM(file.description),
            wysiwygDescription
          );
        }
        //dialog.destroy();
      };
      await run(file, "preview", updateDescription);
    });
    listItem.addEventListener("mouseleave", () => {
      selectedFile = null;
    });
    //*运行脚本（执行）
    listItem.addEventListener("click", async () => {
      dialog.destroy();
      await run(file, "exec", updateState);
    });
    const text = document.createElement("span");
    text.classList.add("b3-list-item__text");
    text.innerText = file.label;
    listItem.appendChild(text);
    /*    //todo
    const open = document.createElement("span");
    open.classList.add("b3-list-item__action");
    open.classList.add("b3-tooltips");
    open.classList.add("b3-tooltips__w");
    open.setAttribute("aria-label", "打开文件位置");
    open.innerHTML = `<svg><use xlink:href="#iconFolder"></use></svg>`;
    listItem.appendChild(open);

      const remove = document.createElement("span");
remove.classList.add("b3-list-item__action");
remove.classList.add("b3-tooltips");
remove.classList.add("b3-tooltips__w");
remove.setAttribute("aria-label", "删除");
remove.innerHTML = `<svg><use xlink:href="#iconTrashcan"></use></svg>`;
listItem.appendChild(remove); */
    return listItem;
  };

  //*文件列表
  const fileListEle = document.createElement("div");
  fileListEle.classList.add("b3-list");
  fileListEle.classList.add("fn__flex-1");
  fileListEle.classList.add("b3-list--background");
  fileListEle.style.position = "relative";
  leftContiainer.appendChild(fileListEle);
  const updateList = (filter?: string) => {
    fileListEle.innerHTML = "";
    files.forEach((file) => {
      if (!filter || file.label.includes(filter)) {
        fileListEle.appendChild(buildListItem(file));
      }
    });
  };
  updateList();

  //*编辑器容器
  const initWysiwygContiainer = (width: string) => {
    //wysiwyg: HTMLDivElement,
    const wysiwygContiainer = document.createElement("div");
    wysiwygContiainer.style.width = width;
    //wysiwygContiainer.style.maxHeight = size.height;
    wysiwygContiainer.style.overflow = "auto";
    utilContiainer.appendChild(wysiwygContiainer);
    return wysiwygContiainer;
  };

  //*更新编辑器内容
  const initWysiwyg = (
    contiainer: HTMLDivElement,
    type: "preview" | "description"
  ) => {
    const wysiwyg = document.createElement("div");
    wysiwyg.setAttribute("data-type", type);
    wysiwyg.classList.add("protyle-wysiwyg");
    contiainer.appendChild(wysiwyg);
    return wysiwyg;
  };
  const updateWysiwyg = async (html: string, wysiwyg: HTMLDivElement) => {
    let prefixHtml = `<div data-node-id="description" data-type="NodeThematicBreak" class="hr"><div></div></div>`;
    const titleText = "###### ";
    if (wysiwyg.getAttribute("data-type") === "description") {
      prefixHtml =
        protyle.lute.Md2BlockDOM(
          titleText + getI18n().dialog_protyle_util_description
        ) + prefixHtml;
    } else if (wysiwyg.getAttribute("data-type") === "preview") {
      let previewText = getI18n().dialog_protyle_util_preview;
      if (store.previewLimit != 0) {
        previewText += getI18n().dialog_protyle_util_preview_memo.replace(
          "${arg1}",
          store.previewLimit.toString()
        );
      }
      prefixHtml =
        protyle.lute.Md2BlockDOM(titleText + previewText) + prefixHtml;
    }

    wysiwyg.innerHTML = prefixHtml + html;
    processRender(wysiwyg);
    wysiwyg.querySelectorAll("[data-node-id]").forEach((block) => {
      if (block.getAttribute("data-type") == "NodeCodeBlock") {
        return;
      }
      block
        .querySelector("[contenteditable]")
        ?.setAttribute("contenteditable", "false");
    });
  };

  //*描述区
  const descriptionContiainer = initWysiwygContiainer(size.midWidth); //("260px");
  const wysiwygDescription = initWysiwyg(descriptionContiainer, "description");
  updateWysiwyg("", wysiwygDescription);
  const getAdditionalStatement = () => {
    const block = wysiwygDescription.querySelector(
      "[data-node-id='additionalStatement']"
    );
    if (!block) {
      return "";
    }
    const codeEle = block.querySelector("[contenteditable='true']");
    return codeEle.textContent;
  };

  //*描述区按钮（中上），参考思源设置 -> 快捷键界面
  const globalToolsEle = document.createElement("div");
  globalToolsEle.classList.add("fn__flex");
  globalToolsEle.classList.add("b3-label");
  globalToolsEle.classList.add("config__item");
  descriptionContiainer.insertBefore(
    globalToolsEle,
    descriptionContiainer.firstElementChild
  );

  //*重新运行
  const initButton = (icon: string, label: string) => {
    const button = document.createElement("button");
    button.className = "b3-button b3-button--outline fn__flex-center";
    button.innerHTML = `<svg><use xlink:href="#${icon}"></use></svg>
    ${label}`;
    return button;
  };
  const updateState = async (file: ISnippet) => {
    file.additionalStatement = getAdditionalStatement();
  };
  const refreshButton = initButton("iconRefresh", "重新运行");
  globalToolsEle.appendChild(refreshButton);
  refreshButton.addEventListener("click", async () => {
    run(lastFile, "preview", updateState);
  });

  //*正式运行
  const runButton = initButton("iconPlay", "正式运行");
  const fn__space = document.createElement("span");
  fn__space.classList.add("fn__space");
  globalToolsEle.appendChild(fn__space);
  globalToolsEle.appendChild(runButton);
  runButton.addEventListener("click", async () => {
    dialog.destroy();
    run(lastFile, "exec", updateState);
  });

  //*预览区
  const wysiwygContiainer = initWysiwygContiainer(size.rightWidth); //("520px");
  //const wysiwyg = initProtyle(wysiwygContiainer);
  const wysiwyg = initWysiwyg(wysiwygContiainer, "preview");
  updateWysiwyg("", wysiwyg);

  //*运行
  const run = async (
    file: ISnippet,
    mode: "preview" | "exec",
    callback?: (file: ISnippet) => Promise<void>
  ) => {
    if (mode == "preview") {
      await updateWysiwyg("正在执行...", wysiwyg);
    }
    let html = "";
    const list = [
      {
        component: EComponent.Copy,
        previewFunc: previewCopy,
        executeFunc: execCopy,
      },
      {
        component: EComponent.Update,
        previewFunc: previewUpdate,
        executeFunc: execUpdate,
      },
      {
        component: EComponent.Paste,
        previewFunc: previewPaste,
        executeFunc: execPaste,
      },
    ];
    const item = list.find((item) => item.component == component);
    if (item) {
      if (mode == "preview") {
        html = await item.previewFunc(file, blockElements, protyle, callback);
      } else if (mode == "exec") {
        await item.executeFunc(file, blockElements, protyle, callback);
      }
    }
    if (mode == "preview") {
      await updateWysiwyg(html, wysiwyg);
    }
  };
  return root;
};
