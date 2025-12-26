const instance =
{
	oppAI: true, 		// OR false
	p1Alias: 'Player1',	// P1 ALIAS
	p1Image: '',		// AVATAR URL
	p2Alias: 'AI',		// OR P2 ALIAS
	p2Image: ''			// AVATAR URL
};

sessionStorage.setItem('gameInstance', JSON.stringify(instance));