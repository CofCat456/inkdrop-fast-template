'use babel';

import React from 'react';
import { CompositeDisposable } from 'event-kit';
import { Dropdown } from 'semantic-ui-react';

export default class FastTemplateMessageDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = { templateNotes: [], noteId: '' };
    this.dialogRef = React.createRef();
  }

  async buildDictionary() {
    // Default TemplateNook Name
    const TEMPLATE_NOTEBOOK_NAME = "_Templates";

    const db = inkdrop.main.dataStore.getLocalDB();
    const templateBook = await db.books.findWithName(TEMPLATE_NOTEBOOK_NAME);
    let templateNotes = [];

    if (templateBook) {
      const notesInBook = await db.notes.findInBook(templateBook._id);
      templateNotes = notesInBook.docs.map((note) => ({
        ...note,
        key: note._id,
        value: note._id,
        text: note.title
      }));
    }
    this.setState({ templateNotes });
  }

  componentWillMount() {
    // Events subscribed to in Inkdrop's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

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

  switchTemplate(noteId) {
    inkdrop.commands.dispatch(document.body, 'core:note-list-show-notes-in-book', { noteId });

    setTimeout(() => {
      inkdrop.commands.dispatch(document.body, 'core:open-note', { noteId, selectInNoteListBar: true });
      inkdrop.commands.dispatch(document.body, 'editor:focus')
    }, 100);

    this.dialogRef.current.dismissDialog();
  }

  handleSwitch = (_event, data) => {
    const switchWithReturnKey = inkdrop.config.get('fast-template.switchWithReturnKey');

    if (switchWithReturnKey) {
      this.setState({ noteId: data.value });
    } else {
      console.log('data.value', data.value)
      this.switchTemplate(data.value);
    }
  };

  handleKeyUp = (event) => {
    const switchWithReturnKey = inkdrop.config.get('fast-template.switchWithReturnKey');

    if (switchWithReturnKey && event.keyCode === 13) {
      this.switchNotebook(this.state.noteId);
    }
  };

  toggle() {
    if (!this.dialogRef.current.isShown) {
      this.buildDictionary();
      this.dialogRef.current.showDialog();
    } else {
      this.dialogRef.current.dismissDialog();
    }
  }

  render() {
    const { MessageDialog } = inkdrop.components.classes;
    return (
      <MessageDialog
        ref={this.dialogRef}
        title="Switch Template"
        buttons={[]}
        modalSettings={{ autofocus: true }}
      >
        <Dropdown
          onKeyUp={this.handleKeyUp}
          options={this.state.templateNotes}
          placeholder="Select template"
          onChange={this.handleSwitch}
          searchInput={<Dropdown.SearchInput className="ui input" />}
          fluid
          selection
          search
        />
      </MessageDialog>
    );
  }
}
