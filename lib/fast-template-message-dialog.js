'use babel';

import React from 'react';
import { CompositeDisposable } from 'event-kit';
import { Dropdown } from 'semantic-ui-react';
import { markdownParserToObject, ObjectMetadataParserToMarkdown } from './markdown-parser';
import { Liquid } from 'liquidjs';
import dayjs from 'dayjs'

export default class FastTemplateMessageDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      templateNotes: [],
    };
    this.dialogRef = React.createRef();
  }

  transformTemplate(title) {
    const promises = this.state.templateNotes.map(async doc => {
      const { metadata, content } = markdownParserToObject(doc.body);
      const engine = new Liquid();

      const date = dayjs().format('YYYY-MM-DD')
      const time = dayjs().format('HH:mm')

      const yamlStr = ObjectMetadataParserToMarkdown(metadata)

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
        body: body,
        doc
      }
    });
    return Promise.all(promises);
  }

  async createNoteFromTemplate(templateId) {
    const db = inkdrop.main.dataStore.getLocalDB()
    const state = inkdrop.store.getState();
    const editingNote = state.editingNote
    // re-get templates for updating current time
    const currentTemplates = await this.transformTemplate(editingNote.title)
    const template = currentTemplates.find(template => template.doc._id === templateId);
    if (!template) {
      console.error("Can Not found template: " + templateId)
      return;
    }
    const tagsWithoutTemplate = template.doc.tags;
    const bodyWithoutTemplate = template.body;
    const note = {
      ...editingNote,
      body: editingNote.body.length === 0 ? bodyWithoutTemplate : `${editingNote.body}\n\n${bodyWithoutTemplate}`,
      tags: [...new Set([...editingNote.tags, ...tagsWithoutTemplate])],
      createdAt: +dayjs(),
      updatedAt: +dayjs(),
    }
    console.log('newNote', note)

    await db.notes.put(note)
    inkdrop.commands.dispatch(document.body, "core:open-note", {
      noteId: note._id,
    })
    inkdrop.commands.dispatch(document.body, "editor:focus-mde")
  }

  async buildDictionary() {
    // Default TemplateNook Name
    const TEMPLATE_NOTEBOOK_NAME = inkdrop.config.get('fast-template.templateFolderName');

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
        'fast-template:open': () => this.open(),
      })
    );
  }

  componentWillUnmount() {
    this.subscriptions.dispose();
  }

  selectTemplate(templateId) {
    inkdrop.commands.dispatch(document.body, `inkdrop-note-templates:${templateId}`);

    this.dialogRef.current.dismissDialog();
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

  checkEditing() {
    const state = inkdrop.store.getState();
    const editingNote = state.editingNote

    return !!editingNote
  }

  open() {
    if (this.checkEditing() === false) return

    if (!this.dialogRef.current.isShown) {
      this.dialogRef.current.showDialog();
    } else {
      this.dialogRef.current.dismissDialog();
    }
  }

  render() {
    const { MessageDialog } = inkdrop.components.classes;

    // FIXME: issue #3437
    return (
      <>
        <MessageDialog
          ref={this.dialogRef}
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
      </>
    );
  }
}
