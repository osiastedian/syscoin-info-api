#!/bin/sh

## Pre execution handler
pre_execution_handler() {
    ## Pre Execution
    # TODO: put your pre execution steps here
    echo "Start Syscoind"
}

## Post execution handler
post_execution_handler() {
    ## Post Execution
    # TODO: put your post execution steps here
    #   syscoind stop;
    echo "Stop Syscoind"
    syscoind stop
}

## Sigterm Handler
sigterm_handler() {
    if [ $pid -ne 0 ]; then
        # the above if statement is important because it ensures
        # that the application has already started. without it you
        # could attempt cleanup steps if the application failed to
        # start, causing errors.
        kill -15 "$pid"
        wait "$pid"
        post_execution_handler
    fi
    exit 143 # 128 + 15 -- SIGTERM
}

## Setup signal trap
# on callback execute the specified handler
trap 'sigterm_handler' INT TERM

## Initialization
pre_execution_handler

## Start Process
# run process in background and record PID
"$@" &
pid="$!"
# Application can log to stdout/stderr, /log/stdout.log or /log/stderr.log

## Wait forever until app dies
wait "$pid"
return_code="$?"

## Cleanup
post_execution_handler
# echo the return code of the application
exit $return_code
