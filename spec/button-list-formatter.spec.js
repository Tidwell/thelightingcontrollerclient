const format = require('../src/button-list-formatter').format;
describe('ButtonListFormatter', () => {
	it('should return an empty object when passed an empty object', () => {
		expect(format({})).toEqual({
			pages: [],
			faders: []
		});
	});

	it('should do nothing if there is no $ property on page', () => {
		expect(format({
			buttons: {
				page: [{}]
			}
		})).toEqual({
			pages: [],
			faders: []
		});
	});

	it('should apply the correct values for name and columns if it finds a $ property', () => {
		expect(format({
			buttons: {
				page: [{
					$: {
						name: 'test',
						columns: 2
					}
				}]
			}
		})).toEqual({
			pages: [{
				name: 'test',
				columns: 2,
				columnButtons: {},
				buttons: []
			}],
			faders: []
		});
	});

	it('should set the columnButtons property if passed', () => {
		expect(format({
			buttons: {
				page: [{
					$: {
						name: 'test',
						columns: 2,
						colbuttons_1: 2,
						colbuttons_2: 4
					}
				}]
			}
		})).toEqual({
			pages: [{
				name: 'test',
				columns: 2,
				columnButtons: {
					1: 2,
					2: 4
				},
				buttons: []
			}],
			faders: []
		});
	});

	it('should set the buttons', () => {
		expect(format({
			buttons: {
				page: [{
					$: {
						name: 'test',
						columns: 2,
						colbuttons_1: 2,
						colbuttons_2: 4
					},
					button: [{
						_: 'name',
						$: {
							index: '4',
							flash: '0',
							pressed: '1',
							line: '1',
							column: '2',
							color: '#00000'
						}
					}]
				}]
			}
		})).toEqual({
			pages: [{
				name: 'test',
				columns: 2,
				columnButtons: {
					1: 2,
					2: 4
				},
				buttons: [{
					name: 'name',
					index: 4,
					flash: false,
					pressed: true,
					line: 1,
					column: 2,
					color: '#00000'
				}]
			}],
			faders: []
		});
	});


	it('should do nothing if faders are empty', () => {
		expect(format({
			buttons: {
				fader: [{}]
			}
		})).toEqual({
			pages: [],
			faders: []
		});
	});

	it('should parse correcly if faders have properties', () => {
		expect(format({
			buttons: {
				fader: [{
					_: 'name',
					$: {
						value: '40'
					}
				}]
			}
		})).toEqual({
			pages: [],
			faders: [{
				name: 'name',
				value: 40
			}]
		});
	});
});
