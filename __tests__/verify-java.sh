#!/bin/sh

EXPECTED_OUTPUT="
Using java version $2"

if [[ "$1" != "$EXPECTED_OUTPUT" ]]; then
  echo "::error::Unexpected output from 'sdk current java': $1"
  exit 1
fi
