import { createElement } from "react";
import type { Preview } from "@storybook/react-vite";
import { enableMocking } from "../src/mocks/browser";
import "../src/styles.css";

const stageStyle = {
  minHeight: "100vh",
  padding: "24px",
  background:
    "radial-gradient(circle at 20% 20%, rgba(244, 139, 84, 0.18), transparent 24%), radial-gradient(circle at 80% 12%, rgba(91, 160, 168, 0.16), transparent 20%), linear-gradient(180deg, #050b10 0%, #091319 100%)",
};

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    controls: {
      expanded: false,
    },
    docs: {
      toc: true,
    },
    options: {
      storySort: {
        order: ["T04", ["Docs", "Pages", "States", "Modes", "Flows"]],
      },
    },
  },
  loaders: [
    async () => {
      await enableMocking();
      return {};
    },
  ],
  decorators: [
    (Story) =>
      createElement(
        "div",
        { style: stageStyle },
        createElement(Story),
      ),
  ],
};

export default preview;
