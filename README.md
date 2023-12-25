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

Note template should have content and metadata as [Yaml Front Matter](https://jekyllrb.com/docs/front-matter/).

- `id`: unique id for [command](https://docs.inkdrop.app/manual/list-of-commands)
- `label`: Menu label for the template
- `title`: Render title with [LiquidJS](https://liquidjs.com/) and set it as new note's title 

```markdown
---
id: test
label: "Test Template"
title: "Test Title"
---

Test body text.

- item 1
- item 2
```

### Use Templates

You can Press `cmd+t` to select.


## Future Todo 

| Description | Progress |
| ------- | ------- |
| Supports consecutive use of the same template  |[Issue #4415](https://github.com/Semantic-Org/Semantic-UI-React/issues/4415)    |


## Inspiration

Thank them for inspiring me to create this plugin.

- [azu/inkdrop-note-templates](https://github.com/azu/inkdrop-note-templates) 
- [marconi/switch-notebook](https://github.com/marconi/switch-notebook) 
- [Obsidian Templates](https://help.obsidian.md/Plugins/Templates)

## Changelog

- 0.1.0 - First release

## 0.2.0 - First Release
* Fixed semantic-ui-react dependencies location
