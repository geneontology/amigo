#!/usr/bin/emacs --script
;;;; 
;;;; Commands for redeploying a package manager distributed Solr/Jetty
;;;; instance with GO data. Tested on Ubuntu 11.04. Can be used from
;;;; the command line or from within Emacs after loading this file.
;;;;
;;;; Usage (cli):
;;;;    sudo ./golr.el
;;;;
;;;; Usage (emacs):
;;;;    M-x load-library <path to this file>
;;;;    M-x golr-
;;;;
;;;; WARNING: These commands use sudo and can affect the filesystem
;;;; and running processes.
;;;;
;;;; BUG: figure out why sudo is wonky and merge golr-no-sudo-restart
;;;; and golr-restart.
;;;;
;;;; BUG: why the double output on my terminal?
;;;;

(require 'cl)
(require 'url)

;;;
;;; Customizable variables.
;;;

(defgroup golr nil
  "GO in Solr Emacs group."
  :prefix "golr-"
  :group 'emacs)

(defcustom golr-jetty-webapps-location "/var/lib/jetty/webapps/"
  "The location of the Jetty webapps directory on your machine."
  :type 'string
  :group 'golr)

(defcustom golr-config-location "~/local/src/git/amigo/golr/"
  "The location of the GOlr config home directory inside the GO SVN repository on your system."
  :type 'string
  :group 'golr)

(defcustom golr-solr-home "/srv/solr/"
  "The Solr home directory--the location of the Solr index data and configuration files. This should be in sync with the value of daraDir in solrconfig.xml."
  :type 'string
  :group 'golr)

(defcustom golr-transfer-schema
  `(("lib" ("solr.war") ,golr-jetty-webapps-location)
    ("jetty" ("jetty") "/etc/default/")
    ("jetty" ("jetty.conf" "jetty-rewrite.xml" "jetty.xml") "/etc/jetty/")
    ("jetty" ("no_access.html") ,(concat golr-jetty-webapps-location "root/"))
    ;;("solr" ("solr.xml") ,golr-solr-home)
    ("solr/conf" ("schema.xml" "solrconfig.xml")
     ,(concat golr-solr-home "conf/")))
  ;;("apache" ("golr") "/etc/apache2/sites-available/")
  "File transfers to make when \"installing\" and before
  restarting. For each sub-list, the first item is the
  sub-directory in golr-config-location, the second item is a list of
  files in that directory to forcably copy, the third item is the
  target directory for the copying."
  :type 'sexp
  :group 'golr)

(defcustom golr-command-schema
  '("/etc/init.d/jetty stop"
    "/etc/init.d/jetty start")
  ;;"/etc/init.d/apache2 restart")
  "Commands to run (as sudo) to restart all of the necessary
system services. It is an ordered list of strings."
  :type 'sexp
  :group 'golr)

;;;
;;; General support functions.
;;;

(defun golr-shell-command (cmnd)
  "Standard shell command with printing."
  (princ (concat "[Golr] " cmnd "\n"))
  (shell-command cmnd))

(defun golr-sudo-prep ()
  "Warm-up sudo for other commands."
  (princ "[Golr] Getting sudo password cached...")
  (shell-command (concat "echo \""
			 (read-passwd "Password: ")
			 "\" | sudo -S whoami")))

(defun golr-copy-file (src dest)
  "Warm-up sudo for other commands."
  (golr-shell-command (concat "sudo cp " src " " dest)))

;; Also: find ./ -type d -exec chmod 755 {} \;
(defun golr-fix-permissions ()
  "Fix the permissions the various places."
  (golr-shell-command (concat "sudo chown jetty "
			      (concat golr-jetty-webapps-location "solr.war")))
  (golr-shell-command (concat "sudo chgrp adm "
			      (concat golr-jetty-webapps-location "solr.war")))
  (golr-shell-command (concat "sudo chown -R jetty " golr-solr-home))
  (golr-shell-command (concat "sudo chgrp -R adm " golr-solr-home)))

;;;
;;; Rollout-specific support functions.
;;;

(defun golr-ready-solr-home ()
  "Create the data directory for the Solr data."
  (golr-shell-command (concat "sudo mkdir -p " (concat golr-solr-home "data")))
  (golr-shell-command (concat "sudo mkdir -p " (concat golr-solr-home "conf"))))

(defun golr-file-rollout ()
  "Moves the SVN files into place. Uses golr-transfer-schema as struct."
  (dolist (x golr-transfer-schema)
    (let ((idir (car x))
	  (ilist (cadr x))
	  (itarget (car (last x))))
      (dolist (i ilist)
	(let ((src (concat idir "/" i))
	      (dest (concat itarget i)))
	  (princ (concat src " to " dest "\n"))
	  ;;(copy-file src dest)
	  (golr-copy-file src dest))))))

(defun golr-services-restart ()
  "Restart services to get Solr/Jetty/Apache back into a testing state."
  (dolist (c golr-command-schema)
    (golr-shell-command (concat "sudo " c))))

;;;
;;; Interactive commands.
;;;

(defun golr-restart-no-sudo ()
  "Deploy all files and restart all services as if had sudo. If running interactively in emacs, you probably want golr-restart instead."
  (interactive)
  (golr-ready-solr-home)
  (cd golr-config-location)
  (golr-file-rollout)
  (golr-fix-permissions)
  (golr-services-restart)
  (princ "golr-restart completed--Solr restarting!\n"))

(defun golr-restart ()
  "Deploy all files and restart all services."
  (interactive)
  (golr-sudo-prep)
  (golr-restart-no-sudo))

;;;
;;; Run from the command line.
;;;

(defun golr-cli ()
  "Command switch for command line use."
  (cond
   ((y-or-n-p "Do Solr/Jetty reset and restart: ")
    (golr-restart-no-sudo))
   (t (princ "skipping..."))))

;; Only run off of cli.
(let ((re "script"))
  (when (delq nil (mapcar (lambda (s) (string-match re s)) command-line-args))
    ;(princ "Detected CLI...")
    (golr-cli)))
