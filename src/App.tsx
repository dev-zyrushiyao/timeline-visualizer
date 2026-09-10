import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import MotionPathPlugin from "gsap/MotionPathPlugin";
import React, { useRef, useState } from "react";
import "./App.css";

gsap.registerPlugin(useGSAP, Draggable, MotionPathPlugin);

export default function App() {
  //use ref
  const container = useRef(null);
  const animationTl = useRef<gsap.core.Timeline>(null);

  //state
  const [timeState, setTimeState] = useState<number>(0);
  const [elem1, setElem1] = useState<string>("Tween-1");
  const [elem2, setElem2] = useState<string>("Tween-2");
  const [elem3, setElem3] = useState<string>("Tween-3");
  const [tweenDur1, setTweenDur1] = useState<number>(0.5);
  const [tweenDur2, setTweenDur2] = useState<number>(0.5);
  const [tweenDur3, setTweenDur3] = useState<number>(0.5);
  const [tweenStart1, setTweenStart1] = useState<string>("0");
  const [tweenStart2, setTweenStart2] = useState<string>(">");
  const [tweenStart3, setTweenStart3] = useState<string>(">");
  const [tweenData, setTweenData] = useState<
    (gsap.core.Timeline | gsap.core.Tween)[]
  >([]);

  //form data for configuration
  //value to display , setter to update
  const formElements = [
    {
      elemVal: elem1,
      elemSetter: setElem1,
      tweenDur: tweenDur1,
      durSetter: setTweenDur1,
      tweenStart: tweenStart1,
      startSetter: setTweenStart1,
    },
    {
      elemVal: elem2,
      elemSetter: setElem2,
      tweenDur: tweenDur2,
      durSetter: setTweenDur2,
      tweenStart: tweenStart2,
      startSetter: setTweenStart2,
    },
    {
      elemVal: elem3,
      elemSetter: setElem3,
      tweenDur: tweenDur3,
      durSetter: setTweenDur3,
      tweenStart: tweenStart3,
      startSetter: setTweenStart3,
    },
  ];

  type TimeStartGuide = { title: string; syntax: string; description: string };

  const formGuide: TimeStartGuide[] = [
    {
      title: "Absolute Time",
      syntax: "2",
      description:
        "Starts at exactly 2 seconds into the timeline, regardless of where other animations are.",
    },
    {
      title: "Relative to Timeline End",
      syntax: "+=1 , -=1",
      description:
        "Starts relative to the current end of the timeline.\n" +
        "+=1 creates a 1-second gap (pause) before starting\n" +
        "-=1 creates a 1-second overlap (starts 1 second before the timeline finishes)",
    },
    {
      title: "Direct Alignment",
      syntax: "<",
      description:
        "Starts at the exact same time as the previous animation's start time (plays concurrently).",
    },
    {
      title: "Sequence End",
      syntax: ">",
      description:
        "Starts at the exact end of the previous animation (default sequential behavior).",
    },
    {
      title: "(Relative to Previous Start",
      syntax: "<-=0.3 , <+=0.3",
      description:
        "Starts relative to the start of the previous animation.\n" +
        "<-=0.3 starts 0.3 seconds before the previous animation starts\n" +
        "<+=0.3 starts 0.3 seconds after the previous animation starts.",
    },
    {
      title: "Relative to Previous End",
      syntax: ">+0.3 , >-0.3",
      description:
        "Starts relative to the end of the previous animation.\n" +
        ">+0.3 adds a 0.3-second delay after the previous animation finishes.\n" +
        ">-0.3 starts 0.3 seconds before the previous animation finishes.",
    },
  ];

  //child distance from #indicator-seconds
  //this is constant , update this value according to the SVG made in Figma
  //Gap 200 and width of number is 10 = 210 as pixelPerSecond
  const pixelPerSecond: number = 210;

  const { contextSafe } = useGSAP(
    () => {
      // 1. Reset timeline playhead to 0 when inputs change
      animationTl.current?.pause(0);

      //timeline
      animationTl.current = gsap.timeline({
        onUpdate: function () {
          const timeVal = this.time().toFixed(2);
          setTimeState(Number(timeVal));
        },
      });
      animationTl.current
        .to(".shape-star", { x: 950, duration: tweenDur1 }, tweenStart1)
        .to(".shape-ellipse", { x: 950, duration: tweenDur2 }, tweenStart2)
        .to(".shape-box", { x: 950, duration: tweenDur3 }, tweenStart3);

      // const chil = animationTl.current.getChildren();
      // chil.forEach((tween, index) => {
      //   console.log(`[Index ${index}] Target:`, tween.targets()[0]);
      //   console.log(`  ├─ Start Time: ${tween.startTime()}s`);
      //   console.log(`  ├─ Duration:   ${tween.duration()}s`);
      //   console.log(`  └─ End Time:    ${tween.endTime()}s`);
      // });

      // Animation children
      // The reason you have to get the class from the timeline itself is because of the ordering execution sequence from timeline vary from its time start
      // if you get the children from the #items (group) it is a static array
      // using it as a selector to tween with dynamic squence order of timeline statTime values will cause a mismatch to the static array
      // for example:
      // get the children from the group : items > [shape-star , shape-ellipse ,shape-box]
      // timeline execution order sequence: timeline > [shape-ellipse , shape-box - shape-star]
      // tween/set the width and timelocation = items[index] != timeline[index]
      // you need to get the classname directly to the timeline in order to get the proper sequence and apply a parallel attribute value to the element we need to target (ui-timeline) to reference them properly on the selector
      // tween animation className: shape-star then UI TIMELINE should be id: shape-star

      const animChildren = animationTl.current.getChildren();
      //set as iterable for Configuration form
      setTweenData(animChildren);

      const childClassArr: string[] = animChildren
        .flatMap((child) => child.targets())
        .map((targetElem: HTMLElement) => targetElem.getAttribute("class"))
        .filter((elemClassName): elemClassName is string =>
          Boolean(elemClassName),
        );

      //reference the childArrId as selector and use animChildren[i] for values
      for (let i = 0; i < animChildren.length; i++) {
        //set the time location of the group (box) in the UI
        gsap.set("#" + childClassArr[i], {
          x: animChildren[i].startTime() * pixelPerSecond,
        });

        //set the length of the width according to the animation duration
        //#shapes-* is a group that contains rect , icon and a text
        gsap.set("#" + childClassArr[i] + "> *", {
          width: animChildren[i].duration() * pixelPerSecond,
        });
      }

      //drag scrub
      const dragObject = document.querySelector("#drag-scrub");
      const tlFrame = document.querySelector("#timeline-ui-frame");
      Draggable.create(dragObject, {
        type: "x",
        bounds: tlFrame,
        edgeResistance: 0,
        onDrag: function () {
          if (!animationTl.current) return;

          //fixed calculation
          const duration = animationTl.current?.duration();
          const targetTime = Math.max(
            0,
            Math.min(duration, this.x / pixelPerSecond),
          );

          //animation timeline behavior when dragged
          if (!animationTl.current) return;
          animationTl.current.pause();
          animationTl.current.progress(targetTime / duration);

          const time = animationTl.current.time().toFixed(2);
          setTimeState(Number(time));
        },
      });
    },
    {
      dependencies: [
        elem1,
        elem2,
        elem3,
        tweenDur1,
        tweenDur2,
        tweenDur3,
        tweenStart1,
        tweenStart2,
        tweenStart3,
      ],
      scope: container,
    },
  );

  function handleClickRewind(): void {
    const context = contextSafe(() => {
      if (!animationTl.current) return;

      const duration = animationTl.current.duration();
      if (duration === 0) return;

      //calculate rewind without changing the timeline
      const targetTime = Math.max(0, animationTl.current.time() - 0.5);
      //animation behavior
      const currentProgress = targetTime / duration;
      const childrenLength = animationTl.current.getChildren().length;
      console.log(childrenLength);

      //tween the rewind
      gsap.to(animationTl.current, {
        progress: currentProgress,
        duration: duration / childrenLength,
      });

      animationTl.current.pause();
    });

    context();
  }

  function handleClickPlay(): void {
    const context = contextSafe(() => {
      if (!animationTl.current) return;

      const currentTimeScale = animationTl.current?.timeScale();
      if (currentTimeScale === 0) {
        gsap.to(animationTl.current, { timeScale: 1, duration: 0.3 });
      }

      animationTl.current.play();
    });

    context();
  }

  function handleClickStop() {
    const context = contextSafe(() => {
      if (!animationTl.current) return;

      animationTl.current.pause();
    });

    context();
  }

  return (
    <div ref={container} className="main">
      <h1>Timeline Visualizer</h1>
      <div className="user-interface flex flex-row">
        <div className="flex flex-col gap-3 p-5">
          <h3>Configuration</h3>
          <div className="config-form">
            {tweenData
              .map((tween) => {
                return tween.targets();
              })
              .map((_, index) => {
                //use the elemName state as key and text value
                //use the map-data to retrieve timeStart and duration
                return (
                  <div
                    key={`elem-card-${index}`}
                    className="item-edit border-2 rounded-2xl p-4 flex flex-col gap-2"
                  >
                    <h4>Element-{index + 1}</h4>
                    <div className="flex lg:flex-row gap-3 flex-col">
                      <div className="flex flex-row items-center gap-2">
                        <p className="form-label">Name:</p>
                        <input
                          type="text"
                          value={formElements[index].elemVal}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            formElements[index].elemSetter(newValue);
                          }}
                        />
                      </div>
                      <div className="flex flex-row items-center gap-2">
                        <p className="form-label">Duration:</p>
                        <input
                          type="number"
                          step="0.5"
                          value={formElements[index].tweenDur}
                          className="border-2"
                          onChange={(e) => {
                            const newValue = e.target.value;
                            formElements[index].durSetter(Number(newValue));
                          }}
                        />
                      </div>
                      <div className="flex flex-row items-center gap-2">
                        <p className="form-label">TimeStart:</p>
                        <input
                          type="text"
                          value={formElements[index].tweenStart}
                          className="border-2"
                          onChange={(e) => {
                            const newValue = e.target.value;
                            formElements[index].startSetter(newValue);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        <div className="w-full max-w-345 h-auto">
          <svg
            viewBox="0 0 1060 505"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="Frame 1596" clipPath="url(#clip0_3709_9880)">
              <rect width={1060} height={505} fill="#282828" />
              <g id="tween-g">
                <path
                  className="shape-star"
                  d="M65.5 11L71.1129 28.2746H89.2764L74.5818 38.9508L80.1946 56.2254L65.5 45.5491L50.8054 56.2254L56.4182 38.9508L41.7236 28.2746H59.8871L65.5 11Z"
                  fill="#DB7272"
                />
                <circle
                  className="shape-ellipse"
                  cx={65.5}
                  cy={104}
                  r={25}
                  fill="#576BEB"
                />
                <rect
                  className="shape-box"
                  x={40.5}
                  y={147}
                  width={50}
                  height={50}
                  fill="#42CE3A"
                />
              </g>
              <rect
                id="timeline-ui-frame"
                y={325}
                width={1060}
                height={104}
                fill="#747474"
              />
              <g id="items">
                <g id="shape-star" className="flex">
                  <rect
                    width={208}
                    height={30}
                    transform="translate(0 325)"
                    fill="#D9D9D9"
                  />
                  <g id="label">
                    <path
                      id="label-icon"
                      d="M10 330L12.2451 336.91H19.5106L13.6327 341.18L15.8779 348.09L10 343.82L4.12215 348.09L6.36729 341.18L0.489435 336.91H7.75486L10 330Z"
                      fill="#DB7272"
                    />
                    <text
                      id="label-caption"
                      fill="black"
                      style={{
                        whiteSpace: "pre",
                      }}
                      xmlSpace="preserve"
                      fontFamily="Inter"
                      fontSize={12}
                      letterSpacing="0em"
                    >
                      <tspan x={32} y={344.364}>
                        {`${elem1}`}
                      </tspan>
                    </text>
                  </g>
                </g>
                <g id="shape-ellipse">
                  <rect
                    width={208}
                    height={30}
                    transform="translate(0 362)"
                    fill="#D9D9D9"
                  />
                  <g id="label_2">
                    <circle
                      id="label-icon_2"
                      cx={10}
                      cy={377}
                      r={10}
                      fill="#576BEB"
                    />
                    <text
                      id="label-caption_2"
                      fill="black"
                      style={{
                        whiteSpace: "pre",
                      }}
                      xmlSpace="preserve"
                      fontFamily="Inter"
                      fontSize={12}
                      letterSpacing="0em"
                    >
                      <tspan x={32} y={381.364}>
                        {`${elem2}`}
                      </tspan>
                    </text>
                  </g>
                </g>
                <g id="shape-box">
                  <rect
                    width={208}
                    height={30}
                    transform="translate(0 399)"
                    fill="#D9D9D9"
                  />
                  <g id="label_3">
                    <rect
                      id="label-icon_3"
                      y={404}
                      width={20}
                      height={20}
                      fill="#42CE3A"
                    />
                    <text
                      id="label-caption_3"
                      fill="black"
                      style={{
                        whiteSpace: "pre",
                      }}
                      xmlSpace="preserve"
                      fontFamily="Inter"
                      fontSize={12}
                      letterSpacing="0em"
                    >
                      <tspan x={32} y={418.364}>
                        {`${elem3}`}
                      </tspan>
                    </text>
                  </g>
                </g>
              </g>
              <g id="control">
                <g id="rewind-btn" onClick={handleClickRewind}>
                  <title>Rewind 0.5s</title>
                  <path
                    id="Polygon"
                    d="M443 463.5L473 446.179V480.821L443 463.5Z"
                    fill="#D9D9D9"
                  />
                </g>
                <g id="stop-btn" onClick={handleClickStop}>
                  <title>Stop</title>
                  <circle
                    id="Ellipse 51"
                    cx={530.5}
                    cy={463.5}
                    r={24.5}
                    fill="#D9D9D9"
                  />
                  <g id="Group 125">
                    <line
                      id="Line 52"
                      x1={526.5}
                      y1={450.5}
                      x2={526.5}
                      y2={475.5}
                      stroke="#6D6262"
                      strokeWidth={5}
                      strokeLinecap="round"
                    />
                    <line
                      id="Line 53"
                      x1={534.5}
                      y1={450.5}
                      x2={534.5}
                      y2={475.5}
                      stroke="#6D6262"
                      strokeWidth={5}
                      strokeLinecap="round"
                    />
                  </g>
                </g>
                <g id="play-btn" onClick={handleClickPlay}>
                  <title>Play</title>
                  <path
                    id="Polygon_2"
                    d="M618 463.5L588 480.821V446.179L618 463.5Z"
                    fill="#D9D9D9"
                  />
                </g>
              </g>
              <path
                id="drag-scrub"
                d="M34 278C41.1797 278 47 283.82 47 291V298C47 305.18 41.1797 311 34 311H6C4.03389 311 2.17062 310.562 0.5 309.78V427C0.5 428.381 -0.619288 429.5 -2 429.5C-3.38071 429.5 -4.5 428.381 -4.5 427V306H-4.24316C-5.96874 303.794 -7 301.018 -7 298V291C-7 283.82 -1.1797 278 6 278H34Z"
                fill="#AF6363"
              />
              <g id="indicator-seconds">
                <text
                  fill="white"
                  style={{
                    whiteSpace: "pre",
                  }}
                  xmlSpace="preserve"
                  fontFamily="Inter"
                  fontSize={12}
                  letterSpacing="0em"
                >
                  <tspan x={1.25} y={298.864}>
                    {"0"}
                  </tspan>
                </text>
                <text
                  fill="white"
                  style={{
                    whiteSpace: "pre",
                  }}
                  xmlSpace="preserve"
                  fontFamily="Inter"
                  fontSize={12}
                  letterSpacing="0em"
                >
                  <tspan x={212.211} y={298.864}>
                    {"1"}
                  </tspan>
                </text>
                <text
                  fill="white"
                  style={{
                    whiteSpace: "pre",
                  }}
                  xmlSpace="preserve"
                  fontFamily="Inter"
                  fontSize={12}
                  letterSpacing="0em"
                >
                  <tspan x={421.367} y={298.864}>
                    {"2"}
                  </tspan>
                </text>
                <text
                  fill="white"
                  style={{
                    whiteSpace: "pre",
                  }}
                  xmlSpace="preserve"
                  fontFamily="Inter"
                  fontSize={12}
                  letterSpacing="0em"
                >
                  <tspan x={631.18} y={298.864}>
                    {"3"}
                  </tspan>
                </text>
                <text
                  fill="white"
                  style={{
                    whiteSpace: "pre",
                  }}
                  xmlSpace="preserve"
                  fontFamily="Inter"
                  fontSize={12}
                  letterSpacing="0em"
                >
                  <tspan x={841.15} y={298.864}>
                    {"4"}
                  </tspan>
                </text>
                <text
                  fill="white"
                  style={{
                    whiteSpace: "pre",
                  }}
                  xmlSpace="preserve"
                  fontFamily="Inter"
                  fontSize={12}
                  letterSpacing="0em"
                >
                  <tspan x={1051.35} y={298.864}>
                    {"5"}
                  </tspan>
                </text>
              </g>
              <g id="time-stamp">
                <text
                  id="Time:"
                  fill="white"
                  style={{
                    whiteSpace: "pre",
                  }}
                  xmlSpace="preserve"
                  fontFamily="Inter"
                  fontSize={12}
                  letterSpacing="0em"
                >
                  <tspan x={859} y={471.864}>
                    {"Time:"}
                  </tspan>
                </text>
                <text
                  fill="white"
                  style={{
                    whiteSpace: "pre",
                  }}
                  xmlSpace="preserve"
                  fontFamily="Inter"
                  fontSize={12}
                  letterSpacing="0em"
                >
                  <tspan x={900} y={471.864}>
                    {timeState}
                  </tspan>
                </text>
              </g>
            </g>
            <defs>
              <clipPath id="clip0_3709_9880">
                <rect width={1060} height={505} fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>
      <div className="guide">
        <h5>Time Start Syntax Guide:</h5>
        <ul>
          {formGuide.map((guide) => {
            return (
              <li>
                <strong>{guide.title}</strong> (Syntax: {guide.syntax})
                <br />
                {guide.description} <br />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
