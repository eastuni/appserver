document.addEventListener('DOMContentLoaded', () => {
  $('#summernote', document).summernote({
    height: 460, // set editor height
    minHeight: 460, // set minimum height of editor
    maxHeight: 460, // set maximum height of editor
    focus: false, // set focus to editable area after initializing summernote
    lang: 'ko-KR', // default: 'en-US'
    toolbar: [
      // [groupName, [list of button]]
      ['style', ['style']],
      ['font', ['bold', 'italic', 'underline', 'clear']],
      ['fontsize', ['fontsize']],
      ['color', ['color']],
      ['para', ['ul', 'ol', 'paragraph']],
      ['table', ['table']],
      ['source', ['source']],
      ['height', ['height']],
      ['pf', ['pf', 'pftpl']],
      ['codeview', ['codeview']],
    ],
  });
});
