confdir=$(dirname $(realpath ${BASH_SOURCE[0]}))

##
## Main HTTP settings for hosting all content

HTTP_PORT=8080 # development nginx listener
# HTTP_PORT=80 # production nginx listener

##
## Control server settings

# File with video definitions for the control server.
CONTROL_CONF_FILE=${confdir}/control.conf.json

# Port the control server will manage websocket connections at.
# No need for this to be privileged.
WEBSOCKET_PORT=8010

##
## LocalDNS related settings

LOCALDNS_PORT=5300 # development listener
# LOCALDNS_PORT=53 # production listener

# Static-ip that localdns will always repond with
LOCALDNS_STATICIP=192.186.0.100

##
## General settings

# The user to run nginx workers as ONLY when running nginx as root (i.e. HTTP_PORT=80)
NGX_USER=${USER}

VARDIR=$(realpath ${confdir}/../var)
LOGDIR=${VARDIR}/log # where to write log files to
RUNDIR=${VARDIR}/run # where pid files are stored
TMPDIR=${VARDIR}/tmp # where tmp things go
