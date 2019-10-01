/**
 * @fileOverview RequireJS로 로드할 모듈 기본 형태(내용은 없음)
 * @see 소스 참고
 */
define(function() {
	var sfd;
	var self = {
		// version info
		version: {
			modified: '{version-modified}',
			deploy: '{version-deploy}',
			hash: '{version-hash}'
		},
		initialization: function(d) {
			sfd = d;
		},
		end: ''
	};
	return self;
});