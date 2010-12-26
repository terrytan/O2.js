# O2计分规则

## 血量计算公式

  * 模式HD满血=100HP
  * 模式NM满血=75HP
  * 模式EZ满血=50HP

  * Cool +0.25
  * Good +0
  * Bad -0.5
  * Miss -3

## O2计分方式

O2Jam中弹到了Note分别会有COOL,GOOD出现,这个大家都知道,而且在达到一定的程度会有JAM出现.开始的时候也就是0JAM的时候COOL200分,GOOD是100分,也就是说GOOD是COOL分数的50%;
1JAM开始到2JAM的时候COOL的分数是210分,GOOD的分数是105分,依然是COOL分数的50%;
2JAM开始到3JAM的时候COOL的分数是220分,GOOD的分数是110分,依然是COOL分数的50%;
3JAM开始到4JAM的时COOL的分数是230分,GOOD的分数是115分,依然是COOL分数的50%;
10JAM开始到11JAM的时候COOL的分数是300分,GOOD的分数是150分,依然是COOL分数的50%;
45JAM开始到46JAM的时候COOL的分数是650分,GOOD的分数是325分,依然是COOL分数的50%;
...依次类推...

这样就不难看出,COOL和GOOD的分数有一个基数分别是200和100,多少个JAM以后就有一个加成,COOL的加成JAM数乘以10,GOOD的加成JAM数乘以5.
比如在45JAM的时候,COOL的基数200+45x10=450最后=650
比如在45JAM的时候,GOOD的基数100+45x5=225最后=325
也就是说基数加上JAM的乘数是每一个NOTE最后的分数,长条的NOTE是算两个不长条的NOTE.
BAD出现时候如果有药那(按早了或按晚了)这个NOTE会消失,是不加分的.不过COMBO继续增加.如果没药,JAM会断.MISS无药可救,JAM会断
