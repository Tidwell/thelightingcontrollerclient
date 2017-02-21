#Changelog

#0.1.0 - 2/20/2017
- Fix faderChange event to fire with faderIndex and NOT faderName to match how Live sends the event
- Add example to scripts folder and to docs
- Fix example in README
- Add CHANGELOG

#0.0.1 - 2/20/2017
- Initial Release.
- Support for all known events defined in the Protocol Definition
- Support for all known methods defined in the Protocol Definition
- Support for undocumented methods: 'FREEZE_ON', 'FREEZE_OFF', 'AUTO_BPM_ON', 'AUTO_BPM_OFF' used in the Live Mobile App
- Mock server for finding undocumented events fired by the Live Mobile App
- 100% test coverage
