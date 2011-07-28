////////////
////
//// org.bbop.amigo.go_meta
////
//// Purpose: Useful information about the GO and AmiGO.
////
//// Note: This is a static default file used for testing.
////       During installation, this file is will be generated dynamically.
////
//////////

//
org.bbop.amigo.go_meta = function(){

    // All of the server/instance-specific meta-data.
    var meta_data = {"html_base":"http://localhost/amigo","app_base":"http://localhost/cgi-bin/amigo","term_regexp":"GO\\:[0-9]{7}","species":[["A. phagocytophilum HZ","212042"],["A. thaliana","3702"],["B. anthracis str. Ames","198094"],["B. taurus","9913"],["C. albicans","5476"],["C. burnetii RSA 493","227377"],["C. elegans","6239"],["C. hydrogenoformans Z-2901","246194"],["C. jejuni RM1221","195099"],["C. perfringens ATCC 13124","195103"],["C. psychrerythraea 34H","167879"],["D. discoideum","44689"],["D. ethenogenes 195","243164"],["D. melanogaster","7227"],["D. pseudoobscura pseudoobscura","46245"],["D. rerio","7955"],["E. chaffeensis str. Arkansas","205920"],["E. coli","562"],["E. coli K-12","83333"],["E. nidulans","162425"],["G. gallus","9031"],["G. sulfurreducens PCA","243231"],["H. immunodeficiency virus 1","11676"],["H. neptunium ATCC 15444","228405"],["H. sapiens","9606"],["L. monocytogenes str. 4b F2365","265669"],["M. capsulatus str. Bath","243233"],["M. fascicularis","9541"],["M. grisea","148305"],["M. musculus","10090"],["N. sennetsu str. Miyayama","222891"],["O. cuniculus","9986"],["O. sativa","4530"],["O. sativa Indica Group","39946"],["O. sativa Japonica Group","39947"],["P. abelii","9601"],["P. aeruginosa PAO1","208964"],["P. falciparum","5833"],["P. fluorescens Pf-5","220664"],["P. syringae pv. phaseolicola 1448A","264730"],["P. syringae pv. tomato str. DC3000","223283"],["R. norvegicus","10116"],["R. pomeroyi DSS-3","246200"],["S. cerevisiae","4932"],["S. oneidensis MR-1","211586"],["S. pombe","4896"],["S. scrofa","9823"],["T. brucei TREU927","185431"],["V. cholerae O1 biovar El tor","686"],["X. (Silurana) tropicalis","8364"],["X. laevis","8355"]],"ontologies":[["biological_process","biological_process"],["cellular_component","cellular_component"],["molecular_function","molecular_function"]],"release_type":"seqdblite","gp_types":[["complex","complex"],["gene","gene"],["protein","protein"],["transcript","transcript"]],"sources":[["AspGD","AspGD"],["CGD","CGD"],["EcoCyc","EcoCyc"],["FB","FB"],["GR_protein","GR_protein"],["GeneDB_Lmajor","GeneDB_Lmajor"],["GeneDB_Pfalciparum","GeneDB_Pfalciparum"],["GeneDB_Spombe","GeneDB_Spombe"],["GeneDB_Tbrucei","GeneDB_Tbrucei"],["JCVI_CMR","JCVI_CMR"],["MGI","MGI"],["NCBI","NCBI"],["NCBI_GP","NCBI_GP"],["NCBI_NP","NCBI_NP"],["PAMGO_VMD","PAMGO_VMD"],["PseudoCAP","PseudoCAP"],["RGD","RGD"],["SGD","SGD"],["SGN","SGN"],["TAIR","TAIR"],["TIGR_CMR","TIGR_CMR"],["UniProt","UniProt"],["UniProtKB","UniProtKB"],["UniProtKB/Swiss-Prot","UniProtKB/Swiss-Prot"],["UniProtKB/TrEMBL","UniProtKB/TrEMBL"],["WB","WB"],["ZFIN","ZFIN"],["dictyBase","dictyBase"]],"release_name":"2009-09-13","evidence_codes":["EXP","IC","IDA","IEP","IGC","IGI","IMP","IPI","ISA","ISM","ISO","ISS","NAS","ND","NR","RCA","TAS"],"image_base":"http://localhost/amigo/images"};

    // Break out the data and various functions to access it...
    var html_base = meta_data.html_base;
    this.html_base = function(){ return html_base; };
    var app_base = meta_data.app_base;
    this.app_base = function(){ return app_base; };
    var term_regexp = meta_data.term_regexp;
    this.term_regexp = function(){ return term_regexp; };
    var species = meta_data.species;
    this.species = function(){ return species; };
    var species_map = meta_data.species_map;
    this.species_map = function(){ return species_map; };
    var ontologies = meta_data.ontologies;
    this.ontologies = function(){ return ontologies; };
    var release_type = meta_data.release_type;
    this.release_type = function(){ return release_type; };
    var gp_types = meta_data.gp_types;
    this.gp_types = function(){ return gp_types; };
    var release_name = meta_data.release_name;
    this.release_name = function(){ return release_name; };
    var sources = meta_data.sources;
    this.sources = function(){ return sources; };
    var image_base = meta_data.image_base;
    this.image_base = function(){ return image_base; };
    var evidence_codes = meta_data.evidence_codes;
    this.evidence_codes = function(){ return evidence_codes; };

    // Does it look like a term?
    var tre_str = meta_data.term_regexp;
    var tre = new RegExp(tre_str);
    this.term_id_p = function(term_id){
       var retval = false;
       if( tre.test(term_id) ){
          retval = true;
       }
       return retval;
    };
};
