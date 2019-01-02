# Release Notes for @iotile/iotile-common

## v0.12.0

- Move to using typescript-logging for all logging.
- Move ObjectBase to use LoggingBase for implementing logging methods.
  There is now a category created for each service object that inherits 
  from LoggingBase.
