#!/bin/sh
git config log.date iso-local
echo  "首次提交时间: $(git log --reverse | sed -n -e "3,3p")"
echo  "最后提交时间: $(git log | sed -n -e "4,4p")"

# exclude-dir 屏蔽统计的文件夹 dir 待统计的文件夹
if [ ! -d "/src" ]; then
  echo  "代码行数: 前端: $(cloc dir | sed -n -e "/^SUM/p"|awk -F' ' '{print $NF}') \t node: $(cloc --exclude-dir=excludedir  dir | sed -n -e "/^SUM/p"|awk -F' ' '{print $NF}') \n"
else
  echo  "代码行数: 前端: $(cloc src | sed -n -e "/^SUM/p"|awk -F' ' '{print $NF}') \n\t node: 0"
fi
# date YYYY-MM-DD 时间
echo "代码维护者列表:\n $(git log --since="date" | grep "^Author: " | awk '{print $2}' | sort | uniq -c | sort -k1,1nr)"
#获取团队内开始维护时间，写入具体知道的第一个维护人git提交邮箱或者名称
echo  "团队首次维护时间: $(git log --reverse  --author="xxx" | sed -n -e "3,3p")"
