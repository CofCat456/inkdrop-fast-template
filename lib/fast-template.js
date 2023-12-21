'use babel';

import FastTemplateMessageDialog from './fast-template-message-dialog';

module.exports = {

  activate() {
    inkdrop.components.registerClass(FastTemplateMessageDialog);
    inkdrop.layouts.addComponentToLayout(
      'modal',
      'FastTemplateMessageDialog'
    )
  },

  deactivate() {
    inkdrop.layouts.removeComponentFromLayout(
      'modal',
      'FastTemplateMessageDialog'
    )
    inkdrop.components.deleteClass(FastTemplateMessageDialog);
  }

};
