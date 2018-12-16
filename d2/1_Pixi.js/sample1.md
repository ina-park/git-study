

![](https://camo.githubusercontent.com/eae4496331dc8533db7c7ff8879c0d6a12da2282/687474703a2f2f706978696a732e646f776e6c6f61642f706978696a732d62616e6e65722e706e67)

# [ 1 ] Pixi.js 로 텍스트 움직여보기

## <u>1. Pixi.js란?</u>

The HTML5 Creation Engine
Create beautiful digital content with the fastest, most flexible 2D <u>**WebGL**</u> **<u>renderer.</u>**

HTML5 생성 엔진
가장 빠르고 유연한 2D WebGL 렌더링을 통해 아름다운 디지털 컨텐츠를 만드십시오.

### WebGL이란?

- 웹 브라우저에서 아무런 플러그인 없이 3D 그래픽을 그릴 수 있는 사실상의 표준 3D 그래픽 라이브러리

- W3C에서 관리하지 않기 때문에 W3C HTML5 스펙에 WebGL 없음. 그러나 사용률 기준 글로벌 브라우저에서 거의 다 WebGL를 지원한다.

- 그림을 그리는 성능이 캔버스보다 뛰어나고, CPU에게 더 많은 여유를 준다. (속도가 )

  비교 : **[Canvas2D](http://hanmomhanda.github.io/WebGL-Study/src/practice/canvas2D-Rect.html)** vs **[WebGL](http://hanmomhanda.github.io/WebGL-Study/src/practice/Shifting-Multiple-Triangles-Opt.html)**

- 비동기 (non-blocking) : JavaScript는 WebGL API인 gl.dorw***() 호출로 그리기를 그래픽 처리 장치 (Graphics Processing Unit)에 위임하고, 그리기 결과 대기없이 바로 다음 라인의 JavaScript를 수행한다.

### rendering이란?

- 평면인 그림에 형태·위치·조명 등 외부의 정보에 따라 다르게 나타나는 [그림자](https://terms.naver.com/entry.nhn?docId=1069294&ref=y)·[색상](https://terms.naver.com/entry.nhn?docId=1110296&ref=y)·[농도](https://terms.naver.com/entry.nhn?docId=1077651&ref=y) 등을 고려하면서 실감나는 3차원 화상을 만들어내는 과정 또는 그러한 기법을 일컫는다.

이 라이브러리를 사용해 만든 애니메이션은, WebGL을 자동적으로 사용해 주고 있다.

pixi.js의 examples 페이지에 여러가지 예제가 소개되어 있다.

- Star warp - sprites

  https://pixijs.io/examples/#/demos/star-warp-sprites.js

- Mouse blending

  https://pixijs.io/examples/#/filters/filter-mouse.js

- Slots demo

  https://pixijs.io/examples/#/demos/slots-demo.js

## <u>2. Pixi.js 설치하기</u>

- https://github.com/pixijs/pixi.js
- https://github.com/pixijs/pixi.js/releases

[**pixi.js**](https://github.com/pixijs/pixi.js/releases/download/v4.8.3/pixi.js) or [**pixi.min.js**](https://github.com/pixijs/pixi.js/releases/download/v4.8.3/pixi.min.js) 를 다운로드 받아 파일을 로드하면, pixi.js 기능을 이용하는것이 가능해진다.

```
<script src="pixi.js"></script>
```

## <u>3. 텍스트 움직여 보기</u>

```
<!DOCTYPE html>
<html lang="ko">
<head>
	<title>sample1</title>
	<meta charset="UTF-8">
	<meta name="description" content="">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<meta name="viewport" content="width=1920, user-scalable=no">
	<script src="js/pixi.js"></script>
</head>
<body>
	<div id="pixiview"></div>
	<script>	
		var width = 600;
		var height = 400;

		//스테이지를 만든다
		var stage = new PIXI.Stage(000);

		//렌더링을 만든다
		var renderer = PIXI.autoDetectRenderer(width, height);

		//렌더링의 View를 html의 요소에 추가한다
		document.getElementById('pixiview').appendChild(renderer.view);

		//텍스트 오브젝트를 만든다
		var text = 'Hello World!';
		var style = new PIXI.TextStyle({
			fontFamily:'Arial',
			fontSize:90,
			fontWeight:'bold',
			fill:'#fff'
		});
		var textobj = new PIXI.Text(text, style);
		textobj.anchor.x = 0.5;
		textobj.anchor.y = 0.5;
		textobj.position.x = width/2;
		textobj.position.y = height/2;

		var blurFilter = new PIXI.filters.BlurFilter();
		textobj.filters = [blurFilter];		
		
		//텍스트 오브젝트를 스테이지에 싣는다
		stage.addChild(textobj);

		var count = 0;
		//애니메이션 함수를 정의한다
		function animate(){
			count += 0.01;
			requestAnimationFrame(animate);			
			var blurAmount = Math.cos(count);
			blurFilter.blur = 20 * (blurAmount);			
			textobj.rotation += 0.03;
			renderer.render(stage);			
		}
		
		//다음의 애니메이션 프레임으로 animate()를 불러온다
		requestAnimationFrame(animate);	
	</script>
</body>
</html>
```

### 전체적인 흐름 

pixi.js 애니메이션은 기본적으로 아래와 같은 흐름으로 이루어진다.

**1. 오브젝트 (화상 스프라이트나 텍스트등), 스테이지, 렌더링을 만든다.**

```
var width = 600;
var height = 400;

var stage = new PIXI.Stage(000);
var renderer = PIXI.autoDetectRenderer(width, height);
```

PIXI.STAGE() 를 생성한다. 파라미터에 있는것은 배경색이다.
PIXI.autoDetectRenderer() 를 생성한다.
지정하고 있는것은, 렌더링이 취급하는 화면영역의 높이, 가로사이즈 이다.

**2. 렌더링의 View를 html의 요소에 추가한다.**

```
document.getElementById('pixiview').appendChild(renderer.view);
```

**3. 애니메이션 오브젝트를 만든다.**

```
var text = 'Hello World!';
var style = new PIXI.TextStyle({
    fontFamily:'Arial',
    fontSize:90,
    fontWeight:'bold',
    fill:'#fff'
});

var blurFilter = new PIXI.filters.BlurFilter();
textobj.filters = [blurFilter];	

var textobj = new PIXI.Text(text, style);
textobj.anchor.x = 0.5;
textobj.anchor.y = 0.5;
textobj.position.x = width/2;
textobj.position.y = height/2;
```

먼저 변수 text에 글자를 넣어주고, new PIXI.TextStyle를 생성하여 글자 사이즈랑 색깔등을 지정해 주고, new PIXI.Text(text, style) 를 생성하여 텍스트의 위치와 값을 정해주었다. anchor와 position 프로퍼티로 객체의 위치를 지정해 주고, blur 효과도 추가했다.

![](https://raw.githubusercontent.com/ina-park/study/master/d2/1_Pixi.js/local/images/img1.png)

**3. 애니메이션 오브젝트를 스테이지에 싣는다**.

```
stage.addChild(textobj);
```

오브젝트 스테이지 등록은 스테이지 오브젝트의 addChilde()메서드로 행한다.

**4. 애니메이션 함수를 정의한다.**

```
var count = 0;
//애니메이션 함수를 정의한다
function animate(){
    count += 0.01;
    var blurAmount = Math.cos(count);
    blurFilter.blur = 20 * (blurAmount); //블러효과			
    textobj.rotation += 0.03; //텍스트 회전
    renderer.render(stage); //그림을 그린다
    requestAnimationFrame(animate); // 다음 타이밍에서 애니메이션을 부른다
}
```

**5. 다음의 애니메이션 프레임으로 animate()를 불러온다.**

```
requestAnimationFrame(animate);	
```



## 참고 사이트

- http://www.pixijs.com
- https://qiita.com/tadfmac
- https://www.slideshare.net/hanmomhanda/web-gl-42962918
- https://terms.naver.com/entry.nhn?docId=1231713&cid=40942&categoryId=32828
- https://www.programering.com/a/MDOxUzMwATA.html
