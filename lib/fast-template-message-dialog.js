'use babel';

import React from 'react';
import { CompositeDisposable } from 'event-kit';
import { Dropdown, Input } from 'semantic-ui-react';
import metadataParser from 'markdown-yaml-metadata-parser';
import { Liquid } from 'liquidjs';
import yaml from 'js-yaml';
import dayjs from 'dayjs'

export default class FastTemplateMessageDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      templateNotes: [],
      templateId: '',
    };
    this.dialog1Ref = React.createRef();
    this.dialog2Ref = React.createRef();
  }

  transformTemplate() {
    const promises = this.state.templateNotes.map(async doc => {
      const { metadata, content } = metadataParser(doc.body);
      const engine = new Liquid();

      const date = dayjs().format('YYYY-MM-DD')
      const title = this.state.title || date
      const time = dayjs().format('HH:mm')

      const yamlStr = Object.keys(metadata).length === 0 ? '' : `---\n${yaml.dump({
        ...metadata
      })}---\n\n`;

      const body = await engine
        .parseAndRender(yamlStr, {
          title,
          date,
          time
        })
        + await engine
        .parseAndRender(content.trim(), {
          title,
          date,
          time
        })

      return {
        title: title,
        body: body,
        doc
      }
    });
    return Promise.all(promises);
  }

  async createNoteFromTemplate(templateId) {
    const db = inkdrop.main.dataStore.getLocalDB()
    // re-get templates for updating current time
    const currentTemplates = await this.transformTemplate()
    const template = currentTemplates.find(template => template.doc._id === templateId);
    if (!template) {
      console.error("Can Not found template: " + templateId)
      return;
    }
    console.log("create note from template: ", templateId);
    const state = inkdrop.store.getState();
    const queryContext = state.queryContext;
    const currentBookId = queryContext.mode === "all"
      ? state.config.core.defaultBook
      : queryContext.bookId;
    const tagsWithoutTemplate = template.doc.tags;
    const note = {
      ...template.doc,
      _id: db.notes.createId(),
      bookId: currentBookId,
      _rev: undefined,
      title: template.title,
      body: template.body,
      tags: tagsWithoutTemplate,
      createdAt: +dayjs(),
      updatedAt: +dayjs(),
    }
    console.log("new note", note);
    await db.notes.put(note)
    inkdrop.commands.dispatch(document.body, "core:open-note", {
      noteId: note._id,
    })
    inkdrop.commands.dispatch(document.body, "editor:focus-mde")
  }

  async buildDictionary() {
    // Default TemplateNook Name
    const TEMPLATE_NOTEBOOK_NAME = "_Templates";

    const db = inkdrop.main.dataStore.getLocalDB();
    const templateBook = await db.books.findWithName(TEMPLATE_NOTEBOOK_NAME);
    let templateNotes = [];

    if (templateBook) {
      const templatesInBook = await db.notes.findInBook(templateBook._id);
      templateNotes = templatesInBook.docs.map((template) => ({
        ...template,
        key: template._id,
        value: template._id,
        text: template.title
      }));
    }
    this.setState({ templateNotes });

    templateNotes.forEach(template => {
      inkdrop.commands.add(document.body, `inkdrop-note-templates:${template._id}`, () => {
        this.createNoteFromTemplate(template._id).catch(error => {
          console.error(error)
        });
      });
    })
  }

  componentWillMount() {
    // Events subscribed to in Inkdrop's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Find templates
    this.buildDictionary()

    // Register command that toggles this dialog
    this.subscriptions.add(
      inkdrop.commands.add(document.body, {
        'fast-template:toggle': () => this.toggle(),
      })
    );
  }

  componentWillUnmount() {
    this.subscriptions.dispose();
  }

  selectTemplate(templateId) {
    this.state.templateId = templateId;

    this.dialog1Ref.current.dismissDialog();
    this.dialog2Ref.current.showDialog();
  }

  handleSelect = (_event, data) => {
    console.log(_event)
    console.log('handle', data)
    this.selectTemplate(data.value);
  };

  handleKeyUp = (event) => {
    const switchWithReturnKey = inkdrop.config.get('fast-template.switchWithReturnKey');

    if (switchWithReturnKey && event.keyCode === 13) {
      this.switchNotebook(this.state.noteId);
    }
  };

  handleEnter = (event) => {
    if (event.charCode === 13) {
      this.state.title = event.target.value;
      inkdrop.commands.dispatch(document.body, `inkdrop-note-templates:${this.state.templateId}`);

      this.dialog2Ref.current.dismissDialog();
    }
  };

  toggle() {
    if (!this.dialog1Ref.current.isShown) {
      this.dialog1Ref.current.showDialog();
    } else {
      this.dialog1Ref.current.dismissDialog();
    }
  }

  render() {
    const { MessageDialog } = inkdrop.components.classes;

    // FIXME: issue #3437
    return (
      <>
        <MessageDialog
          ref={this.dialog1Ref}
          title="Select Template"
          buttons={[]}
          modalSettings={{ autofocus: true }}
        >
          <Dropdown
            onKeyUp={this.handleKeyUp}
            options={this.state.templateNotes}
            placeholder="Select template"
            onChange={this.handleSelect}
            searchInput={<Dropdown.SearchInput className="ui input" />}
            fluid
            selection
            search
          />
        </MessageDialog>
        <MessageDialog
          ref={this.dialog2Ref}
          title="Input Title"
          buttons={[]}
          modalSettings={{ autofocus: true }}
        >
          <Input
            onKeyPress={this.handleEnter}
            className="ui input"
          />
        </MessageDialog>
      </>
    );
  }
}
