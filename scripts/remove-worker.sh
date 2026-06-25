#!/bin/bash
# Post-build script to remove _worker.js from dist
# This prevents Pages Functions from being deployed with broken API handlers

if [ -f "dist/_worker.js" ]; then
  echo "Removing dist/_worker.js to prevent Pages Functions conflicts..."
  rm dist/_worker.js
  echo "Done."
fi
