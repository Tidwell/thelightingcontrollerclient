Bugs

- Adjusting a fader on a client app does not re-broadcast a FADER_CHANGE event (it does broadcast if a fader changes using Live)

- client Freeze event is not documented
	'FREEZE_ON'
	'FREEZE_OFF'
	
- Freeze event is not broadcast or re-broadcast.  (sending FREEZE_ON or FREEZE_OFF from a client app does not send a event to other client apps AND toggling FREEZE in Live does not send an event to client apps)

- client AutoBPM event is not documented
	'AUTO_BPM_ON'
	'AUTO_BPM_OFF'

- AutoBPM toggle event is not broadcast or re-broadcast.  (sending AUTO_BPM_ON or AUTO_BPM_OFF from a client app does not send an event to other client apps AND toggling AUTOBPM in Live does not send an event to client apps)


- Sending BEAT event does nothing? (windows only??)
- Have not seen a BPM or BEAT_OFF message (windows only??)
