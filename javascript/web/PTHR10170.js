//// (http://amigo.berkeleybop.org/amigo/panther/PTHR10004.tree).
//// AN0(AN1(AN2(XP_800359:0.687,XP_790652:0.774,XP_800360:0.695):0.473,AN6(Q7RKB3:1.366,Q7RBF2:1.208):0.223):1.0,Q747I8:1.0);

// Not all needed, but good habit?
bbop.core.require('bbop', 'core');
bbop.core.require('bbop', 'model');
bbop.core.require('bbop', 'model', 'tree');
bbop.core.require('bbop', 'widget', 'phylo_old');

// Run the layout after everything is loaded.
window.onload = function(){

    ///
    /// Our take on PTHR10170.
    /// 

    // Example graph hand loaded through tree.
    var r0 = new bbop.widget.phylo_old.renderer('test0', true);

    function _quick_node_add(nid){
	var new_node = new bbop.model.tree.node(nid);
	r0.add_node(new_node);
    }
    function _quick_edge_add(sid, oid, d){
	var new_edge = new bbop.model.tree.edge(sid, oid, d);
	r0.add_edge(new_edge);
    }

    _quick_node_add('AN0');

    _quick_node_add('AN1');
    _quick_node_add('EAL71324');
    _quick_edge_add('AN0', 'AN1', 0.48);
    _quick_edge_add('AN0', 'EAL71324', 0.48);

    _quick_node_add('AN2');
    _quick_node_add('AN36');
    _quick_edge_add('AN1', 'AN2', 0.563);
    _quick_edge_add('AN1', 'AN36', 0.439);

    _quick_node_add('AN38');
    _quick_node_add('Q9U999');
    _quick_edge_add('AN36', 'AN38', 0.31);
    _quick_edge_add('AN36', 'Q9U999', 0.379);

    _quick_node_add('AGAP003682-PA');
    _quick_node_add('AGAP003681-PA');
    _quick_edge_add('AN38', 'AGAP003682-PA', 2.0);
    _quick_edge_add('AN38', 'AGAP003681-PA', 0.755);

    _quick_node_add('AN3');
    _quick_node_add('AN4');
    _quick_node_add('AN5');
    _quick_node_add('AN6');
    _quick_node_add('AN7');
    _quick_node_add('AN8');
    _quick_node_add('AN9');
    _quick_node_add('AN10');
    _quick_node_add('AN11');
    _quick_node_add('AN12');
    _quick_node_add('P42858');
    _quick_node_add('ENSPTRP00000027313');
    _quick_node_add('ENSMMUP00000011008');
    _quick_node_add('AN16');
    _quick_node_add('P42859');
    _quick_node_add('P51111');
    _quick_node_add('ENSBTAP00000001972');
    _quick_node_add('ENSMODP00000004420');
    _quick_node_add('ENSOANP00000016906');
    _quick_node_add('XP_420822');
    _quick_node_add('Q66KL5');
    _quick_node_add('AN24');
    _quick_node_add('P51112');
    _quick_node_add('AN27');
    _quick_node_add('ENSCINP00000020100');
    _quick_node_add('ENSCINP00000020101');
    _quick_node_add('ENSCINP00000022904');
    _quick_node_add('ENSCINP00000022901');
    _quick_node_add('AN32');
    _quick_node_add('XP_795551');
    _quick_node_add('XP_001193149');
    _quick_node_add('XP_001200298');


    _quick_edge_add('AN24', 'P51112', 0.065);
    _quick_edge_add('AN24', 'O42269', 0.021);

    _quick_edge_add('AN16', 'P42859', 0.022);
    _quick_edge_add('AN16', 'P51111', 0.044);

    _quick_edge_add('AN12', 'P42858', 0.0);
    _quick_edge_add('AN12', 'ENSPTRP00000027313', 0.0);

    _quick_edge_add('AN11', 'AN12', 0.0);
    _quick_edge_add('AN11', 'ENSMMUP00000011008', 0.043);

    _quick_edge_add('AN10', 'AN11', 0.021);
    _quick_edge_add('AN10', 'AN16', 0.0);

    _quick_edge_add('AN9', 'AN10', 0.0);
    _quick_edge_add('AN9', 'ENSBTAP00000001972', 0.021);

    _quick_edge_add('AN8', 'AN9', 0.0);
    _quick_edge_add('AN8', 'ENSMODP00000004420', 0.0);

    _quick_edge_add('AN7', 'AN8', 0.0);
    _quick_edge_add('AN7', 'ENSOANP00000016906', 0.028);

    _quick_edge_add('AN6', 'AN7', 0.021);
    _quick_edge_add('AN6', 'XP_420822', 0.043);

    _quick_edge_add('AN5', 'AN6', 0.0);
    _quick_edge_add('AN5', 'Q66KL5', 0.028);

    _quick_edge_add('AN4', 'AN5', 0.065);
    _quick_edge_add('AN4', 'AN24', 0.044);

    _quick_edge_add('AN27', 'ENSCINP00000020100', 2.0);
    _quick_edge_add('AN27', 'ENSCINP00000020101', 2.0);
    _quick_edge_add('AN27', 'ENSCINP00000022904', 1.667);
    _quick_edge_add('AN27', 'ENSCINP00000022901', 1.667);

    _quick_edge_add('AN3', 'AN4', 0.118);
    _quick_edge_add('AN3', 'AN27', 0.822);

    _quick_edge_add('AN32', 'XP_795551', 1.68);
    _quick_edge_add('AN32', 'XP_001193149', 0.411);
    _quick_edge_add('AN32', 'XP_001200298', 0.411);

    _quick_edge_add('AN2', 'AN3', 0.025);
    _quick_edge_add('AN2', 'AN32', 0.0);


    // Set settable rendering properties.
    r0.use_animation = true;
    r0.box_width = 115;
    r0.box_height = 25;

    // Display.
    r0.display();
};
