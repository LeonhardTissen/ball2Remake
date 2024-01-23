const audioData = {
	"urls": [
		"/static/audio/1.ogg",
		"/static/audio/1.m4a",
		"/static/audio/1.mp3",
		"/static/audio/1.ac3"
	],
	"sprite": {
		"Bom": [
			0,
			99.8639455782313
		],
		"BRE": [
			2000,
			228.93424036281164
		],
		"CLIA": [
			4000,
			362.81179138322005
		],
		"CRII": [
			6000,
			275.9183673469385
		],
		"DIE": [
			8000,
			134.6938775510207
		],
		"FOOD": [
			10000,
			14.965986394557262
		],
		"ITM": [
			12000,
			181.4058956916096
		],
		"KICK": [
			14000,
			81.63265306122369
		],
		"TI": [
			16000,
			157.09750566893277
		]
	}
}

export const sound = new Howl({
    src: audioData.urls,
    sprite: audioData.sprite,
    autoplay: true
});
sound.volume(0.1);
