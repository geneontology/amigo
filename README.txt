Want to deny scripts, conf, and perl.
Will try and model after this, but run out of directory:
        ## mod_perl
        <Location /cgi-bin/amigo/completion>
            SetHandler perl-script
            PerlResponseHandler ModPerl::Registry
            PerlOptions +ParseHeaders
            Options +ExecCGI
            Order allow,deny
            Allow from all 
        </Location>
