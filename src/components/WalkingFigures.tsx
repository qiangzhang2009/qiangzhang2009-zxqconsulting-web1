/**
 * 底部卡通人物带 - OpenPeeps 风格
 * 参考 MiroFish 官网效果：两排人物平行滚动，肩部以上多样造型
 * 使用方式：在Hero版块底部添加 <WalkingFigures />
 */

import { useMemo } from 'react';

// 导入所有 OpenPeeps SVG 图片
import peep2 from '../../Mirofish - Predict Anything_files/openpeeps2.svg';
import peep6 from '../../Mirofish - Predict Anything_files/openpeeps6.svg';
import peep8 from '../../Mirofish - Predict Anything_files/openpeeps8.svg';
import peep10 from '../../Mirofish - Predict Anything_files/openpeeps10.svg';
import peep12 from '../../Mirofish - Predict Anything_files/openpeeps12.svg';
import peep15 from '../../Mirofish - Predict Anything_files/openpeeps15.svg';
import peep18 from '../../Mirofish - Predict Anything_files/openpeeps18.svg';
import peep19 from '../../Mirofish - Predict Anything_files/openpeeps19.svg';
import peep22 from '../../Mirofish - Predict Anything_files/openpeeps22.svg';
import peep23 from '../../Mirofish - Predict Anything_files/openpeeps23.svg';
import peep24 from '../../Mirofish - Predict Anything_files/openpeeps24.svg';
import peep25 from '../../Mirofish - Predict Anything_files/openpeeps25.svg';
import peep28 from '../../Mirofish - Predict Anything_files/openpeeps28.svg';
import peep29 from '../../Mirofish - Predict Anything_files/openpeeps29.svg';
import peep32 from '../../Mirofish - Predict Anything_files/openpeeps32.svg';
import peep33 from '../../Mirofish - Predict Anything_files/openpeeps33.svg';
import peep34 from '../../Mirofish - Predict Anything_files/openpeeps34.svg';
import peep36 from '../../Mirofish - Predict Anything_files/openpeeps36.svg';
import peep37 from '../../Mirofish - Predict Anything_files/openpeeps37.svg';
import peep40 from '../../Mirofish - Predict Anything_files/openpeeps40.svg';
import peep43 from '../../Mirofish - Predict Anything_files/openpeeps43.svg';
import peep44 from '../../Mirofish - Predict Anything_files/openpeeps44.svg';
import peep47 from '../../Mirofish - Predict Anything_files/openpeeps47.svg';
import peep49 from '../../Mirofish - Predict Anything_files/openpeeps49.svg';
import peep50 from '../../Mirofish - Predict Anything_files/openpeeps50.svg';
import peep52 from '../../Mirofish - Predict Anything_files/openpeeps52.svg';
import peep54 from '../../Mirofish - Predict Anything_files/openpeeps54.svg';
import peep58 from '../../Mirofish - Predict Anything_files/openpeeps58.svg';
import peep59 from '../../Mirofish - Predict Anything_files/openpeeps59.svg';
import peep60 from '../../Mirofish - Predict Anything_files/openpeeps60.svg';
import peep62 from '../../Mirofish - Predict Anything_files/openpeeps62.svg';
import peep63 from '../../Mirofish - Predict Anything_files/openpeeps63.svg';
import peep70 from '../../Mirofish - Predict Anything_files/openpeeps70.svg';
import peep73 from '../../Mirofish - Predict Anything_files/openpeeps73.svg';
import peep74 from '../../Mirofish - Predict Anything_files/openpeeps74.svg';
import peep78 from '../../Mirofish - Predict Anything_files/openpeeps78.svg';
import peep79 from '../../Mirofish - Predict Anything_files/openpeeps79.svg';
import peep80 from '../../Mirofish - Predict Anything_files/openpeeps80.svg';
import peep82 from '../../Mirofish - Predict Anything_files/openpeeps82.svg';
import peep84 from '../../Mirofish - Predict Anything_files/openpeeps84.svg';
import peep86 from '../../Mirofish - Predict Anything_files/openpeeps86.svg';
import peep87 from '../../Mirofish - Predict Anything_files/openpeeps87.svg';
import peep88 from '../../Mirofish - Predict Anything_files/openpeeps88.svg';
import peep93 from '../../Mirofish - Predict Anything_files/openpeeps93.svg';
import peep94 from '../../Mirofish - Predict Anything_files/openpeeps94.svg';
import peep95 from '../../Mirofish - Predict Anything_files/openpeeps95.svg';
import peep97 from '../../Mirofish - Predict Anything_files/openpeeps97.svg';
import peep100 from '../../Mirofish - Predict Anything_files/openpeeps100.svg';
import peep102 from '../../Mirofish - Predict Anything_files/openpeeps102.svg';
import peep103 from '../../Mirofish - Predict Anything_files/openpeeps103.svg';
import peep104 from '../../Mirofish - Predict Anything_files/openpeeps104.svg';
import peep105 from '../../Mirofish - Predict Anything_files/openpeeps105.svg';

// 所有人物 SVG 图片数组
const CHARACTER_SVGS = [
  peep2, peep6, peep8, peep10, peep12, peep15, peep18, peep19,
  peep22, peep23, peep24, peep25, peep28, peep29, peep32, peep33,
  peep34, peep36, peep37, peep40, peep43, peep44, peep47, peep49,
  peep50, peep52, peep54, peep58, peep59, peep60, peep62, peep63,
  peep70, peep73, peep74, peep78, peep79, peep80, peep82, peep84,
  peep86, peep87, peep88, peep93, peep94, peep95, peep97, peep100,
  peep102, peep103, peep104, peep105,
];

export default function WalkingFigures() {
  // 生成两排人物数据 - 每排重复多次以实现无缝滚动
  const row1Characters = useMemo(() => [...CHARACTER_SVGS, ...CHARACTER_SVGS, ...CHARACTER_SVGS], []);
  const row2Characters = useMemo(() => [...CHARACTER_SVGS, ...CHARACTER_SVGS, ...CHARACTER_SVGS].reverse(), []);

  return (
    <div className="walking-figures-strip">
      {/* 第一排：从左到右 */}
      <div className="figures-row figures-row--right">
        <div className="figures-track">
          {row1Characters.map((svg, i) => (
            <div key={`r1-${i}`} className="figure-item">
              <img src={svg} alt="" className="figure-svg-img" />
            </div>
          ))}
        </div>
      </div>
      
      {/* 第二排：从右到左 */}
      <div className="figures-row figures-row--left">
        <div className="figures-track">
          {row2Characters.map((svg, i) => (
            <div key={`r2-${i}`} className="figure-item">
              <img src={svg} alt="" className="figure-svg-img" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
