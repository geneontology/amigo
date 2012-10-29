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
amigo.data.statistics.annotation_source = [["MGI", 140675], ["UniProtKB", 94446], ["ZFIN", 86096], ["PomBase", 31869], ["RGD", 23092], ["dictyBase", 20566], ["GOC", 6234], ["RefGenome", 5312], ["BHF-UCL", 4432], ["IntAct", 772], ["HGNC", 473], ["DFLAT", 304], ["PINC", 17], ["Roslin_Institute", 10], ["ENSEMBL", 2], ["Reactome", 1]];

/*
 * Variable: annotation_source
 * 
 * TBD
 */
amigo.data.statistics.annotation_evidence = [["similarity evidence", 105129], ["experimental evidence", 99636], ["curator inference", 54629]];

/*
 * Variable: annotation_overview
 * 
 * TBD
 */
amigo.data.statistics.annotation_overview = [["Source", "similarity evidence", "experimental evidence", "curator inference", "author statement", "combinatorial evidence", "genomic context evidence", "biological system reconstruction", "imported information"], ["MGI", 51772, 53474, 33293, 0, 0, 0, 0, 0], ["ZFIN", 0, 10202, 11115, 0, 0, 0, 0, 0], ["PomBase", 10121, 14791, 3570, 0, 0, 0, 0, 0], ["dictyBase", 9293, 4312, 6478, 0, 0, 0, 0, 0]];
