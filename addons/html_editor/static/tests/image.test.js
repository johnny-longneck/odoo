import { expect, test } from "@odoo/hoot";
import { click, queryOne, waitFor } from "@odoo/hoot-dom";
import { animationFrame } from "@odoo/hoot-mock";
import { setupEditor } from "./_helpers/editor";
import { contains } from "@web/../tests/web_test_helpers";
import { setContent } from "./_helpers/selection";

const base64Img =
    "data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUA\n        AAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO\n            9TXL0Y4OHwAAAABJRU5ErkJggg==";

test("image can be selected", async () => {
    const { editor } = await setupEditor(`
        <img src="${base64Img}">
    `);

    click("img");
    await waitFor(".o-we-toolbar");
    expect(".btn-group[name='image_shape']").toHaveCount(1);
    const selectionPlugin = editor.plugins.find((p) => p.constructor.name === "selection");
    expect(selectionPlugin.getSelectedNodes()[0].tagName).toBe("IMG");
});

test("can shape an image", async () => {
    await setupEditor(`
        <img src="${base64Img}">
    `);
    const img = queryOne("img");
    click(img);
    await waitFor(".o-we-toolbar");

    const buttons = {};
    for (const buttonName of ["shape_rounded", "shape_circle", "shape_shadow", "shape_thumbnail"]) {
        buttons[buttonName] = `.o-we-toolbar button[name='${buttonName}']`;
    }

    click(buttons["shape_rounded"]);
    await animationFrame();
    expect(buttons["shape_rounded"]).toHaveClass("active");
    expect(img).toHaveClass("rounded");

    click(buttons["shape_rounded"]);
    await animationFrame();
    expect(buttons["shape_rounded"]).not.toHaveClass("active");
    expect(img).not.toHaveClass("rounded");

    click(buttons["shape_circle"]);
    await animationFrame();
    expect(buttons["shape_circle"]).toHaveClass("active");
    expect(img).toHaveClass("rounded-circle");

    click(buttons["shape_shadow"]);
    await animationFrame();
    expect(buttons["shape_shadow"]).toHaveClass("active");
    expect(img).toHaveClass("shadow");

    click(buttons["shape_thumbnail"]);
    await animationFrame();
    expect(buttons["shape_thumbnail"]).toHaveClass("active");
    expect(img).toHaveClass("img-thumbnail");
});

test("shape_circle and shape_rounded are mutually exclusive", async () => {
    await setupEditor(`
        <img src="${base64Img}">
    `);
    const img = queryOne("img");
    click(img);
    await waitFor(".o-we-toolbar");

    const buttons = {};
    for (const buttonName of ["shape_rounded", "shape_circle", "shape_shadow", "shape_thumbnail"]) {
        buttons[buttonName] = `.o-we-toolbar button[name='${buttonName}']`;
    }

    click(buttons["shape_rounded"]);
    await animationFrame();
    expect(buttons["shape_rounded"]).toHaveClass("active");
    expect(img).toHaveClass("rounded");

    click(buttons["shape_circle"]);
    await animationFrame();
    expect(buttons["shape_circle"]).toHaveClass("active");
    expect(img).toHaveClass("rounded-circle");
    expect(buttons["shape_rounded"]).not.toHaveClass("active");
    expect(img).not.toHaveClass("rounded");

    click(buttons["shape_rounded"]);
    await animationFrame();
    expect(buttons["shape_rounded"]).toHaveClass("active");
    expect(img).toHaveClass("rounded");
    expect(buttons["shape_circle"]).not.toHaveClass("active");
    expect(img).not.toHaveClass("rounded-circle");
});

test("can undo a shape", async () => {
    const { editor } = await setupEditor(`
        <img src="${base64Img}">
    `);
    click("img");
    await waitFor(".o-we-toolbar");

    click(".o-we-toolbar button[name='shape_rounded']");
    await animationFrame();
    expect(".o-we-toolbar button[name='shape_rounded']").toHaveClass("active");
    expect("img").toHaveClass("rounded");
    editor.dispatch("HISTORY_UNDO");
    await animationFrame();
    expect(".o-we-toolbar button[name='shape_rounded']").not.toHaveClass("active");
    expect("img").not.toHaveClass("rounded");
});

test("can add an image description & tooltip", async () => {
    await setupEditor(`
        <img src="${base64Img}">
    `);
    click("img");
    await waitFor(".o-we-toolbar");

    click(".o-we-toolbar .btn-group[name='image_description'] button");
    await animationFrame();

    expect(".modal-body").toHaveCount(1);
    await contains("input[name='description']").edit("description modified");
    await contains("input[name='tooltip']").edit("tooltip modified");
    click(".modal-footer button");
    await animationFrame();
    expect("img").toHaveAttribute("alt", "description modified");
    expect("img").toHaveAttribute("title", "tooltip modified");
});

test("can edit an image description & tooltip", async () => {
    await setupEditor(`
        <img class="img-fluid test-image" src="${base64Img}" alt="description" title="tooltip">
    `);
    click("img.test-image");
    await waitFor(".o-we-toolbar");

    click(".o-we-toolbar .btn-group[name='image_description'] button");
    await animationFrame();

    expect(".modal-body").toHaveCount(1);
    expect("input[name='description']").toHaveValue("description");
    expect("input[name='tooltip']").toHaveValue("tooltip");
    await contains("input[name='description']").edit("description modified");
    await contains("input[name='tooltip']").edit("tooltip modified");
    click(".modal-footer button");
    await animationFrame();
    expect("img").toHaveAttribute("alt", "description modified");
    expect("img").toHaveAttribute("title", "tooltip modified");
});

test("Can change an image size", async () => {
    await setupEditor(`
        <img class="img-fluid test-image" src="${base64Img}">
    `);
    click("img.test-image");
    await waitFor(".o-we-toolbar");
    expect(queryOne("img").style.width).toBe("");
    expect(".o-we-toolbar button[name='resize_default']").toHaveClass("active");

    click(".o-we-toolbar button[name='resize_100']");
    await animationFrame();
    expect(queryOne("img").style.width).toBe("100%");
    expect(".o-we-toolbar button[name='resize_100']").toHaveClass("active");

    click(".o-we-toolbar button[name='resize_50']");
    await animationFrame();
    expect(queryOne("img").style.width).toBe("50%");
    expect(".o-we-toolbar button[name='resize_50']").toHaveClass("active");

    click(".o-we-toolbar button[name='resize_25']");
    await animationFrame();
    expect(queryOne("img").style.width).toBe("25%");
    expect(".o-we-toolbar button[name='resize_25']").toHaveClass("active");

    click(".o-we-toolbar button[name='resize_default']");
    await animationFrame();
    expect(queryOne("img").style.width).toBe("");
    expect(".o-we-toolbar button[name='resize_default']").toHaveClass("active");
});

test("Can undo the image sizing", async () => {
    const { editor } = await setupEditor(`
        <img class="img-fluid test-image" src="${base64Img}">
    `);
    click("img.test-image");
    await waitFor(".o-we-toolbar");

    click(".o-we-toolbar button[name='resize_100']");
    await animationFrame();
    expect(queryOne("img").style.width).toBe("100%");
    expect(".o-we-toolbar button[name='resize_100']").toHaveClass("active");

    editor.dispatch("HISTORY_UNDO");
    expect(queryOne("img").style.width).toBe("");
});

test("Can change the padding of an image", async () => {
    await setupEditor(`
        <img class="img-fluid test-image" src="${base64Img}">
    `);
    click("img.test-image");
    await waitFor(".o-we-toolbar");

    click(".o-we-toolbar div[name='image_padding'] button");
    await animationFrame();
    click(".o_popover div:contains('Small')");
    await animationFrame();
    expect("img").toHaveClass("p-1");

    click(".o-we-toolbar div[name='image_padding'] button");
    await animationFrame();
    click(".o_popover div:contains('Medium')");
    await animationFrame();
    expect("img").not.toHaveClass("p-1");
    expect("img").toHaveClass("p-2");

    click(".o-we-toolbar div[name='image_padding'] button");
    await animationFrame();
    click(".o_popover div:contains('Large')");
    await animationFrame();
    expect("img").not.toHaveClass("p-2");
    expect("img").toHaveClass("p-3");

    click(".o-we-toolbar div[name='image_padding'] button");
    await animationFrame();
    click(".o_popover div:contains('XL')");
    await animationFrame();
    expect("img").not.toHaveClass("p-3");
    expect("img").toHaveClass("p-5");

    click(".o-we-toolbar div[name='image_padding'] button");
    await animationFrame();
    click(".o_popover div:contains('None')");
    await animationFrame();
    expect("img").not.toHaveClass("p-5");
});

test("Can undo the image padding", async () => {
    const { editor } = await setupEditor(`
        <img class="img-fluid test-image" src="${base64Img}" alt="description" title="tooltip">
    `);
    click("img.test-image");
    await waitFor(".o-we-toolbar");

    click(".o-we-toolbar div[name='image_padding'] button");
    await animationFrame();
    click(".o_popover div:contains('Small')");
    await animationFrame();
    expect("img").toHaveClass("p-1");

    editor.dispatch("HISTORY_UNDO");
    await animationFrame();
    expect("img").not.toHaveClass("p-1");
});

test("Can preview an image", async () => {
    await setupEditor(`
        <img class="img-fluid test-image" src="${base64Img}">
    `);
    click("img.test-image");
    await waitFor(".o-we-toolbar");
    click(".o-we-toolbar button[name='image_preview']");
    await animationFrame();
    expect(".o-FileViewer").toHaveCount(1);
});

test("Can transform an image", async () => {
    await setupEditor(`
        <img class="img-fluid test-image" src="${base64Img}">
    `);
    click("img.test-image");
    await waitFor(".o-we-toolbar");
    click(".o-we-toolbar button[name='image_transform']");
    await animationFrame();
    const transfoContainers = document.querySelectorAll(".transfo-container");
    expect(transfoContainers.length).toBe(1);
    // The created transformation container is outside of the hoot fixture, clean it manually
    for (const transfoContainer of transfoContainers) {
        transfoContainer.remove();
    }
});

test("jquery transform overlay is rightly positioned in iframe", async () => {
    const { el } = await setupEditor(
        `
        <img class="img-fluid test-image" src="${base64Img}">
    `,
        { props: { iframe: true } }
    );
    click(":iframe img.test-image");
    await waitFor(".o-we-toolbar");
    click(".o-we-toolbar button[name='image_transform']");
    await animationFrame();
    expect(":iframe .transfo-controls").toHaveCount(1);
    expect(el.contains(queryOne(":iframe .transfo-controls"))).toBe(false);
});

test("Image transformation dissapear when selection change", async () => {
    const { el } = await setupEditor(`
        <img class="img-fluid test-image" src="${base64Img}">
        <p> Hello world </p>
    `);
    click("img.test-image");
    await waitFor(".o-we-toolbar");
    click(".o-we-toolbar button[name='image_transform']");
    await animationFrame();
    let transfoContainers = document.querySelectorAll(".transfo-container");
    expect(transfoContainers.length).toBe(1);

    setContent(
        el,
        `<img class="img-fluid test-image" src="/web/static/img/logo.png">
        <p> [Hello] world </p> `
    );
    await animationFrame();
    transfoContainers = document.querySelectorAll(".transfo-container");
    expect(transfoContainers.length).toBe(0);
    // Remove the transfoContainer element if not destroyed by the selection change
    for (const transfoContainer of transfoContainers) {
        transfoContainer.remove();
    }
});

test("Can delete an image", async () => {
    await setupEditor(`
        <p> <img class="img-fluid test-image" src="${base64Img}"> </p>
    `);
    expect(".test-image").toHaveCount(1);
    click("img");
    await waitFor(".o-we-toolbar");
    expect("button[name='image_delete']").toHaveCount(1);
    click("button[name='image_delete']");
    await animationFrame();
    expect(".test-image").toHaveCount(0);
});

test("Toolbar detect image namespace even if it is the only child of a p", async () => {
    await setupEditor(`
        <p><img class="img-fluid test-image" src="${base64Img}"></p>
    `);
    expect(".test-image").toHaveCount(1);
    click("img");
    await waitFor(".o-we-toolbar");
    expect("button[name='image_delete']").toHaveCount(1);
});

test("Toolbar detects image namespace when there is text next to it", async () => {
    await setupEditor(`
        <p><img class="img-fluid test-image" src="${base64Img}">abc</p>
    `);
    expect(".test-image").toHaveCount(1);
    click("img");
    await waitFor(".o-we-toolbar");
    expect("button[name='image_delete']").toHaveCount(1);
});
