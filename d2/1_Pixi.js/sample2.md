

![](https://camo.githubusercontent.com/eae4496331dc8533db7c7ff8879c0d6a12da2282/687474703a2f2f706978696a732e646f776e6c6f61642f706978696a732d62616e6e65722e706e67)

# [ 2 ] Pixi.js 로 이미지 움직여보기

## <u>1. Pixi.js의 여러가지 속성에 접근해 보기</u>

### 객체, 속성의 개념 이해

자바스크립트는 객체 지향적 언어라고 한다. 생활 주변에서 볼 수 있는 사람, 동물 자전거, 꽃 등 모든 사물이 객체이다.

자바스크립트에서 객체(Object)란 웹브라우저를 포함한 웹 문서의 모든 구성요소를 말한다.

즉, 웹브라우저의 상태표시줄, 스크롤바, 웹문서 자체, 레이어, 하이퍼링크, 이미지, 폼버튼 등등 대부분의 구성요소를 객체라고 한다. 객체들은 또다른 하위 객체들을 가지고 있을 수 있다. 이런 이유로 자바스크립트의 객체구조를 계층적 구조라고 말할수 있다.

모든 객체는 속성(Property)를 가진다.

window 객체는 frames(프레임), name(윈도우 이름), location(위치) 등의 속성을 가지며, 이미지 객체는 가로크기, 세로크기등의 속성을 가진다.

예를들어 어떤 웹문서의 배경색상이 검정색이라면, 이 웹문서의 배경색은 검정이라는 속성을 가지며 자바스크립트에서는 다음과 같이 표현할 수 있다.

```
document.bgColor="black" (객체.속성="속성값")
```

### [pixi.js 속성 링크](https://www.goodboydigital.com/pixijs/docs/classes/Sprite.html)

기본적인 pixi.js속성을 봐보자.

**1. position, rotation**

- position은, 스프라이트 위치를 정해주는 속성이다.
- rotation은, 오브젝트 회전을 하게 한다. 양수는 우회전, 음수는 왼쪽으로 돈다.

**2. scale**

- scale은 원래 크기의 상대적인 비율을 지정하는 속성이다. 다음은 화면을 1.5배로 하는 코드이다.

```
img.scale.x = 1.5;
img.scale.y = 1.5;
```

**3. alpha**

- alpha는 투명도를 지정하는 속성이다. 0~1사이에서 지정한다. 0으로 갈수록 투명해진다.

```
img.alpha = 0.5;
```

## <u>2. 이미지 움직여 보기</u>

```
<!DOCTYPE html>
<html lang="ko">
<head>
	<title>Pixi.js로 이미지 움직여보기</title>
	<meta charset="UTF-8">
	<meta name="description" content="">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<meta name="viewport" content="width=1920, user-scalable=no">
	<script src="js/pixi.dev.js"></script>

	<style type="text/css">
		body {margin:0;padding:0;}
	</style>
</head>

<body>
	<div id="pixiview"></div>
	
	<script>	
		var width = 600;
		var height = 400;

		//스테이지를 만든다
		var stage = new PIXI.Stage(0xFFFFFF);

		//렌더링을 만든다
		var renderer = PIXI.autoDetectRenderer(width, height);

		//렌더링의 View를 html의 요소에 추가한다
		document.getElementById("pixiview").appendChild(renderer.view);

		//스프라이트 오브젝트를 만든다
		var texture = PIXI.Texture.fromImage('images/letter.png');
		var maxLetter = 10;
		var letterImg = [];

		//알파벳
		for(var cnt=0;cnt < maxLetter;cnt ++){
			letterImg.push(new PIXI.Sprite(texture));
			letterImg[cnt].position.x = Math.random() * 600;
			letterImg[cnt].position.y = Math.random() * 400;
			letterImg[cnt].anchor.x = 0.5;
			letterImg[cnt].anchor.y = 0.5;
			var base = Math.random();
			letterImg[cnt].alpha = (base/2) + 0.4;
			letterImg[cnt].scale.x = base/2;
			letterImg[cnt].scale.y = base/2;
			//스프라이트를 스테이지에 올린다
			stage.addChild(letterImg[cnt]);
		}

		//애니메이션의 개수를 정의한다
		function animate(){
			requestAnimFrame(animate);
			for(cnt=0; cnt<maxLetter; cnt++){
				var scale = letterImg[cnt].scale.x;
				letterImg[cnt].position.x += scale * (Math.random() - 0.5) * 4;
				letterImg[cnt].position.y += (scale * 3) + 1;
				if(letterImg[cnt].position.y > 400){
					letterImg[cnt].position.y = -10;
				}
			}
			renderer.render(stage);
		}

		//다음의 애니메이션 프레임으로 animate()를 불러온다
		requestAnimFrame(animate);

	</script>
</body>
</html>
```



## 링크

- https://code.d2.co.kr/inapark/study/1_Pixi.js/local/sample2



## 참고 사이트

- http://www.pixijs.com
- https://qiita.com/tadfmac
- http://bamtol.net/v5/bbs/board.php?bo_table=pp_js&wr_id=84

