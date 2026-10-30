const quote = (file) => `"${file}"`;

// The root ESLint config ignores widgets/** — each widget lints itself with
// its own config. Group staged files so root files are linted from the repo
// root and widget files from inside their widget.
const eslintTasks = (files) => {
  const rootFiles = [];
  const byWidget = new Map();

  for (const file of files) {
    const widget = file.replaceAll('\\', '/').match('/widgets/([^/]+)/')?.[1];
    if (widget) {
      byWidget.set(widget, [...(byWidget.get(widget) ?? []), file]);
    } else {
      rootFiles.push(file);
    }
  }

  const tasks = [];
  if (rootFiles.length > 0) {
    tasks.push(
      `eslint --fix --no-warn-ignored ${rootFiles.map(quote).join(' ')}`,
    );
  }
  for (const [widget, widgetFiles] of byWidget) {
    tasks.push(
      `pnpm -C "widgets/${widget}" exec eslint --fix --no-warn-ignored ${widgetFiles.map(quote).join(' ')}`,
    );
  }

  return tasks;
};

export default {
  // Array syntax runs in order: eslint --fix first, then prettier --write.
  '*.{js,jsx,ts,tsx}': [eslintTasks, 'prettier --write'],
  '*.{json,css,md,html,yaml,yml,vue,svelte,graphql}': 'prettier --write',
};
