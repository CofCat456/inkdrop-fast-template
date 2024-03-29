# inkdrop-fast-template

Fast use template.

![inkdrop-fast-template](https://i.imgur.com/os7nGrM.png)

## Install

```
ipm install inkdrop-fast-template
```

## Usage

### Create Templates

> [!IMPORTANT]  
Create templates under `_Templates` notebook.

> You can custom the template folder name

#### Support
- `{{title}}`: Note Title
- `{{date}}`: date(YYYY-MM-DD) with [dayjs](https://day.js.org/)
- `{{time}}`: title(HH:mm) with [dayjs](https://day.js.org/)

#### Example
```markdown
---
title: {{title}}
date: {{date}}
time: {{time}}
---

Note Title is {{title}}
Current Time is {{date}}:{{time}}
```

### Use Templates

You can Press `cmd+t` to select.

![Preview](https://i.imgur.com/dYVvx2a.gif)

## Future Todo 

| Description | Progress |
| ------- | ------- |
| Supports consecutive use of the same template  |[Issue #4415](https://github.com/Semantic-Org/Semantic-UI-React/issues/4415)    |

## Inspiration

Thank them for inspiring me to create this plugin.

- [azu/inkdrop-note-templates](https://github.com/azu/inkdrop-note-templates) 
- [marconi/switch-notebook](https://github.com/marconi/switch-notebook) 
- [Obsidian Templates](https://help.obsidian.md/Plugins/Templates)
