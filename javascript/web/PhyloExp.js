//// (http://amigo.berkeleybop.org/amigo/panther/PTHR10004.tree).
//// AN0(AN1(AN2(XP_800359:0.687,XP_790652:0.774,XP_800360:0.695):0.473,AN6(Q7RKB3:1.366,Q7RBF2:1.208):0.223):1.0,Q747I8:1.0);

// Not all needed, but good habit?
bbop.core.require('bbop', 'core');
bbop.core.require('bbop', 'model');
bbop.core.require('bbop', 'model', 'tree');
bbop.core.require('bbop', 'widget', 'phylo_old');

// Run the layout after everything is loaded.
window.onload = function(){

    // Example graph hand loaded through tree.
    var r0 = new bbop.widget.phylo_old.renderer('test0', true);

    function _quick_node_add(r, nid){
	var new_node = new bbop.model.tree.node(nid);
	r.add_node(new_node);
    }
    function _quick_edge_add(r, sid, oid, d){
	var new_edge = new bbop.model.tree.edge(sid, oid, d);
	r.add_edge(new_edge);
    }

    _quick_node_add(r0, 'AN0');

    _quick_node_add(r0, 'AN1');
    _quick_node_add(r0, 'EAL71324');
    _quick_edge_add(r0, 'AN0', 'AN1', 0.48);
    _quick_edge_add(r0, 'AN0', 'EAL71324', 0.48);

    _quick_node_add(r0, 'AN2');
    _quick_node_add(r0, 'AN36');
    _quick_edge_add(r0, 'AN1', 'AN2', 0.563);
    _quick_edge_add(r0, 'AN1', 'AN36', 0.439);

    _quick_node_add(r0, 'AN38');
    _quick_node_add(r0, 'Q9U999');
    _quick_edge_add(r0, 'AN36', 'AN38', 0.31);
    _quick_edge_add(r0, 'AN36', 'Q9U999', 0.379);

    _quick_node_add(r0, 'AGAP003682-PA');
    _quick_node_add(r0, 'AGAP003681-PA');
    _quick_edge_add(r0, 'AN38', 'AGAP003682-PA', 2.0);
    _quick_edge_add(r0, 'AN38', 'AGAP003681-PA', 0.755);

    _quick_node_add(r0, 'AN3');
    _quick_node_add(r0, 'AN32');
    _quick_edge_add(r0, 'AN2', 'AN3', 0.025);
    _quick_edge_add(r0, 'AN2', 'AN32', 0.0);

    _quick_node_add(r0, 'XP_795551');
    _quick_node_add(r0, 'XP_001193149');
    _quick_node_add(r0, 'XP_001200298');
    _quick_edge_add(r0, 'AN32', 'XP_795551', 1.68);
    _quick_edge_add(r0, 'AN32', 'XP_001193149', 0.411);
    _quick_edge_add(r0, 'AN32', 'XP_001200298', 0.411);

    // _quick_node_add(r0, 'AN4');
    // _quick_node_add(r0, 'AN5');
    // _quick_node_add(r0, 'AN6');
    // _quick_node_add(r0, 'AN7');
    // _quick_node_add(r0, 'AN8');
    // _quick_node_add(r0, 'AN9');
    // _quick_node_add(r0, 'AN10');
    // _quick_node_add(r0, 'AN11');
    // _quick_node_add(r0, 'AN12');
    // _quick_node_add(r0, 'P42858');
    // _quick_node_add(r0, 'ENSPTRP00000027313');
    // _quick_node_add(r0, 'ENSMMUP00000011008');
    // _quick_node_add(r0, 'AN16');
    // _quick_node_add(r0, 'P42859');
    // _quick_node_add(r0, 'P51111');
    // _quick_node_add(r0, 'ENSBTAP00000001972');
    // _quick_node_add(r0, 'ENSMODP00000004420');
    // _quick_node_add(r0, 'ENSOANP00000016906');
    // _quick_node_add(r0, 'XP_420822');
    // _quick_node_add(r0, 'Q66KL5');
    // _quick_node_add(r0, 'AN24');
    // _quick_node_add(r0, 'P51112');
    // _quick_node_add(r0, 'AN27');
    // _quick_node_add(r0, 'ENSCINP00000020100');
    // _quick_node_add(r0, 'ENSCINP00000020101');
    // _quick_node_add(r0, 'ENSCINP00000022904');
    // _quick_node_add(r0, 'ENSCINP00000022901');

    // _quick_edge_add(r0, 'AN24', 'P51112', 0.065);
    // _quick_edge_add(r0, 'AN24', 'O42269', 0.021);

    // _quick_edge_add(r0, 'AN16', 'P42859', 0.022);
    // _quick_edge_add(r0, 'AN16', 'P51111', 0.044);

    // _quick_edge_add(r0, 'AN12', 'P42858', 0.0);
    // _quick_edge_add(r0, 'AN12', 'ENSPTRP00000027313', 0.0);

    // _quick_edge_add(r0, 'AN11', 'AN12', 0.0);
    // _quick_edge_add(r0, 'AN11', 'ENSMMUP00000011008', 0.043);

    // _quick_edge_add(r0, 'AN10', 'AN11', 0.021);
    // _quick_edge_add(r0, 'AN10', 'AN16', 0.0);

    // _quick_edge_add(r0, 'AN9', 'AN10', 0.0);
    // _quick_edge_add(r0, 'AN9', 'ENSBTAP00000001972', 0.021);

    // _quick_edge_add(r0, 'AN8', 'AN9', 0.0);
    // _quick_edge_add(r0, 'AN8', 'ENSMODP00000004420', 0.0);

    // _quick_edge_add(r0, 'AN7', 'AN8', 0.0);
    // _quick_edge_add(r0, 'AN7', 'ENSOANP00000016906', 0.028);

    // _quick_edge_add(r0, 'AN6', 'AN7', 0.021);
    // _quick_edge_add(r0, 'AN6', 'XP_420822', 0.043);

    // _quick_edge_add(r0, 'AN5', 'AN6', 0.0);
    // _quick_edge_add(r0, 'AN5', 'Q66KL5', 0.028);

    // _quick_edge_add(r0, 'AN4', 'AN5', 0.065);
    // _quick_edge_add(r0, 'AN4', 'AN24', 0.044);

    // _quick_edge_add(r0, 'AN27', 'ENSCINP00000020100', 2.0);
    // _quick_edge_add(r0, 'AN27', 'ENSCINP00000020101', 2.0);
    // _quick_edge_add(r0, 'AN27', 'ENSCINP00000022904', 1.667);
    // _quick_edge_add(r0, 'AN27', 'ENSCINP00000022901', 1.667);

    // _quick_edge_add(r0, 'AN3', 'AN4', 0.118);
    // _quick_edge_add(r0, 'AN3', 'AN27', 0.822);

    // Set settable rendering properties.
    r0.use_animation = true;
    r0.box_width = 85;
    r0.box_height = 25;

    // Display.
    r0.display();

    ///
    /// Nonsense trials.
    /// 

    // Example graph hand loaded through tree.
    var r1 = new bbop.widget.phylo_old.renderer('test1');
    _quick_node_add(r1, 'AN0');
    _quick_node_add(r1, 'AN1');
    _quick_node_add(r1, 'AN2');
    _quick_node_add(r1, 'AN6');
    _quick_node_add(r1, 'XP_800359');
    _quick_node_add(r1, 'XP_790652');
    _quick_node_add(r1, 'XP_800360');
    _quick_node_add(r1, 'Q7RKB3');
    _quick_node_add(r1, 'Q7RBF2');
    _quick_node_add(r1, 'Q747I8');
    _quick_edge_add(r1, 'AN0', 'AN1', 1.0);
    _quick_edge_add(r1, 'AN0', 'Q747I8', 1.0);
    _quick_edge_add(r1, 'AN1', 'AN2', 0.473);
    _quick_edge_add(r1, 'AN1', 'AN6', 0.223);
    _quick_edge_add(r1, 'AN2', 'XP_800359', 0.687);
    _quick_edge_add(r1, 'AN2', 'XP_790652', 0.774);
    _quick_edge_add(r1, 'AN2', 'XP_800360', 0.695);
    _quick_edge_add(r1, 'AN6', 'Q7RKB3', 1.366);
    _quick_edge_add(r1, 'AN6', 'Q7RBF2', 1.208);

    // Set settable rendering properties.
    r1.use_animation = true;

    // Display.
    r1.display();

    //
    var r2 = new bbop.widget.phylo_old.renderer('test2');
    _quick_node_add(r2, 'A0');
    _quick_node_add(r2, 'D0');
    _quick_node_add(r2, 'D1');
    _quick_node_add(r2, 'D2');
    _quick_node_add(r2, 'D3');
    _quick_node_add(r2, 'D4');
    _quick_edge_add(r2, 'A0', 'D0', 1.0);
    _quick_edge_add(r2, 'A0', 'D1', 1.5);
    _quick_edge_add(r2, 'A0', 'D2', 2.0);
    _quick_edge_add(r2, 'A0', 'D3', 2.5);
    _quick_edge_add(r2, 'A0', 'D4', 3.0);
    r2.box_width = 100;
    r2.box_height = 20;    
    r2.display();

    //
    var r3 = new bbop.widget.phylo_old.renderer('test3');
    _quick_node_add(r3, 'A0');
    _quick_node_add(r3, 'D0');
    _quick_node_add(r3, 'D1');
    _quick_node_add(r3, 'D2');
    _quick_node_add(r3, 'D3');
    _quick_node_add(r3, 'D4');
    _quick_edge_add(r3, 'A0', 'D0', 1.0);
    _quick_edge_add(r3, 'A0', 'D1', 1.5);
    _quick_edge_add(r3, 'A0', 'D2', 2.0);
    _quick_edge_add(r3, 'A0', 'D3', 2.5);
    _quick_edge_add(r3, 'A0', 'D4', 3.0);
    r3.box_width = 20;
    r3.box_height = 20;    
    r3.display();
};
