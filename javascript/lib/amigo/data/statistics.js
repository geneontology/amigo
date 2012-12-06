/*
 * Package: statistics.js
 * 
 * Namespace: amigo.data.statistics
 * 
 * This package was automatically created during an AmiGO 2 installation.
 * 
 * Purpose: Useful numbers about the current data in the store.
 * 
 * Requirements: amigo.js for bbop.amigo namespace.
 * 
 * NOTE: This file is generated dynamically at installation time.
 *       Hard to work with unit tests--hope it's not too bad.
 *       Want to keep this real simple.
 */

// Module and namespace checking.
bbop.core.require('bbop', 'core');
bbop.core.namespace('amigo', 'data', 'statistics');

/*
 * Variable: annotation_evidence
 * 
 * TBD
 */
amigo.data.statistics.annotation_source = [["UniProtKB", 648243], ["InterPro", 538277], ["ENSEMBL", 219415], ["TIGR", 166869], ["MGI", 144434], ["CGD", 117773], ["AspGD", 116630], ["RGD", 87770], ["ZFIN", 86208], ["FlyBase", 78621], ["JCVI", 78268], ["TAIR", 70190], ["WB", 67370], ["GR", 50329], ["SGD", 43471], ["PAMGO_MGG", 42572], ["PomBase", 31755], ["MTBBASE", 25609], ["Reactome", 20891], ["dictyBase", 20571], ["RefGenome", 19566], ["GOC", 15382], ["UniPathway", 15241], ["BHF-UCL", 15002], ["GeneDB_Pfalciparum", 8928], ["IntAct", 6394], ["EcoCyc", 6159], ["PINC", 5609], ["PseudoCAP", 4394], ["HPA", 3604], ["GeneDB_Tbrucei", 3553], ["HGNC", 2778], ["EcoliWiki", 2323], ["EnsemblPlants/Gramene", 2236], ["AgBase", 2109], ["GeneDB_Lmajor", 903], ["PAMGO", 647], ["SGN", 562], ["DFLAT", 444], ["ASAP", 296], ["GONUTS", 284], ["PAMGO_GAT", 260], ["LIFEdb", 206], ["REFGENOME", 97], ["PAMGO_VMD", 75], ["EnsemblFungi", 60], ["Roslin_Institute", 54], ["GDB", 28], ["WormBase", 26], ["Eurofung", 5]];

/*
 * Variable: annotation_source
 * 
 * TBD
 */
amigo.data.statistics.annotation_evidence = [["similarity evidence", 398219], ["experimental evidence", 350498], ["curator inference", 350258], ["combinatorial evidence", 66446], ["author statement", 65394], ["genomic context evidence", 807]];

/*
 * Variable: annotation_overview
 * 
 * TBD
 */
amigo.data.statistics.annotation_overview = [["Source", "similarity evidence", "experimental evidence", "curator inference", "author statement", "combinatorial evidence", "genomic context evidence", "biological system reconstruction", "imported information"], ["dictyBase", 9293, 4317, 6478, 483, 0, 0, 0, 0], ["EcoCyc", 415, 5548, 1, 40, 142, 0, 0, 0], ["FlyBase", 13935, 30400, 6973, 12954, 19, 18, 0, 0], ["MGI", 52964, 56237, 33094, 2004, 135, 0, 0, 0], ["PomBase", 10194, 8795, 4310, 1173, 727, 0, 0, 0], ["RGD", 66561, 15031, 2107, 1780, 3, 0, 0, 0], ["SGD", 3389, 33124, 4591, 2366, 1, 0, 0, 0], ["TAIR", 11078, 16600, 8453, 1664, 14752, 0, 0, 0], ["WB", 858, 32613, 59, 145, 1, 0, 0, 0], ["ZFIN", 505, 10417, 11076, 127, 0, 0, 0, 0]];
