////
//// Templates for output build around bbop.html.
//// Takes namespace GOlrTemplate.
////
//// TODO/BUG: remove the bits of bbop.html interface we don't need?
////

bbop.core.require('bbop', 'core');
bbop.core.require('bbop', 'html');
bbop.core.namespace('GOlrTemplate');

GOlrTemplate.two_column_layout = function (col1, col2){
    bbop.html.tag.call(this, 'div', {'class': 'twocol-wrapper'});

    // Left (control) side.
    this._two_column_stack_left =
	new bbop.html.tag('div',
			  {'class': 'twocol-leftcolumn',
			   'style': 'margin-top: -15px;'},
			  col1);
    this.add_to(this._two_column_stack_left);

    // Right (display) side.
    this._two_column_stack_right =
	new bbop.html.tag('div',
			  {'class': 'twocol-content',
			   'style': 'margin-left: 26em; margin-top: -15px;'},
			  col2);
    this.add_to(this._two_column_stack_right);
};
GOlrTemplate.two_column_layout.prototype = new bbop.html.tag;

// ...
GOlrTemplate.meta_results = function (total, first, last){
    bbop.html.tag.call(this, 'div');

    this.add_to('Total: ' + total + '&nbsp;&nbsp;&nbsp;');
    this.add_to('First: ' + first + '&nbsp;&nbsp;&nbsp;');
    this.add_to('Last: ' + last + '<br />');
    this.add_to('TODO: paging');
    // <a id="for_paging_id_f0ccpl4zp0" href="#results_block">forward -&gt;</a>
};
GOlrTemplate.meta_results.prototype = new bbop.html.tag;

// ...
GOlrTemplate.results_table_bio = function (header_list, results_list){
    bbop.html.tag.call(this, 'div');

    this.add_to('Total: ' + total + '&nbsp;&nbsp;&nbsp;');

    var p1 = new bbop.html.tag('p');
    var p2 = new bbop.html.tag('p');

// <p></p>
// <table>
// <thead>
// <tr>
// <th>score</th>
// <th>category</th>
// <th>symbol</th>
// <th>type</th>
// <th>description</th>
// <th>source</th>
// <th>species</th>
// </tr>
// </thead>
// <tbody>
// </tbody>
// </table>
// <p></p>

    this.add_to('Total: ' + total + '&nbsp;&nbsp;&nbsp;');
    this.add_to('First: ' + first + '&nbsp;&nbsp;&nbsp;');
    this.add_to('Last: ' + last + '<br />');
    this.add_to('TODO: paging');
    // <a id="for_paging_id_f0ccpl4zp0" href="#results_block">forward -&gt;</a>
};
GOlrTemplate.results_table_bio.prototype = new bbop.html.tag;
