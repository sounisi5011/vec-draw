'use strict';

const fs = require('fs');
const path = require('path');
const consoleMsg = require('./src/console-msg.js');
const indent = require('./src/indent.js');

const [ COMMIT_MSG_FILE, COMMIT_SOURCE, SHA1 ] = (process.env.HUSKY_GIT_PARAMS || process.env.GIT_PARAMS || '').split(' ');
const SCRIPT_PATH = './' + path.relative(process.cwd(), process.argv[1]);
const OUTPUT_PREFIX = `${SCRIPT_PATH} > `;

let exitCode = 0;
process.on('exit', () => {
  process.exit(exitCode);
});

function allowMerge() {
  /*
   * マージを許可
   */
  exitCode = 0;
}

function pullRequestOnlyMerge(current_branch, merge_branch) {
  /*
   * マージを拒否（Pull Requestのみ許可）
   */
  console.error(consoleMsg(OUTPUT_PREFIX, [
    `${current_branch} ブランチに ${merge_branch} ブランチを`,
    `ローカルでマージすることは禁止されています。`,
    'git merge --abort コマンドでマージ操作を取り消してください。',
    '',
    'マージする場合は、マージ操作の取り消し後、',
    'git push origin HEAD コマンドを実行してリモートにプッシュしてから、',
    'GitHub上でPull Requestを作成してください。',
  ]));
}

function denyMerge(current_branch, merge_branch, allowBranchList = []) {
  /*
   * マージを拒否
   */
  const denyBranchList = (
    ['master', 'develop', 'feature/*', 'release/*', 'hotfix/*']
      .filter(branchName => !allowBranchList.includes(branchName))
  );

  console.error(consoleMsg(
    OUTPUT_PREFIX,
    [
      `${current_branch} ブランチに ${merge_branch} ブランチを`,
      `マージすることは禁止されています。`,
      'git merge --abort コマンドでマージ操作を取り消してください。',
      (0 < allowBranchList.length) ? (
        !allowBranchList.includes('*') ?
        `\nこのブランチはマージ可能です： ${allowBranchList.join(' ')}` :
        `\nこのブランチはマージ禁止です： ${denyBranchList.join(' ')}`
      ) : null,
    ]
  ));
}

if (COMMIT_SOURCE === 'merge') {
  exitCode = 1;

  (() => {
    try {
      /*
       * コミットメッセージを取得する
       */
      const msgFilePath = path.resolve(process.cwd(), COMMIT_MSG_FILE);
      const commitMsg = fs.readFileSync(msgFilePath).toString();

      /*
       * マージ元とマージ先のブランチを取得する
       */
      const match = /^Merge branch '([^ \r\n]+)' into ([^ \r\n]+)$/m.exec(commitMsg);
      if (!match) {
        console.error(`${OUTPUT_PREFIX}[!] コミットメッセージの解析に失敗しました:\n${indent(commitMsg, 4)}`);
        return;
      }
      const [, merge_branch, current_branch] = match;

      /*
       * ブランチを比較し、マージを許可するか拒否するかを判定する
       */
      if (current_branch === 'master') {
        /*
         * masterブランチへのマージ
         * + Pull Requestのみ許可: release/*, hotfix/*
         * + 禁止: develop, feature/*, *
         */
        const allowBranchList = ['release/*', 'hotfix/*'];

        if (/^(release|hotfix)\//.test(merge_branch)) {
          /*
           * Pull Requestのみ許可: release/*, hotfix/*
           */
          pullRequestOnlyMerge(current_branch, merge_branch);
        } else {
          /*
           * 禁止: develop, feature/*, *
           */
          denyMerge(current_branch, merge_branch, allowBranchList);
        }

      } else if (current_branch === 'develop') {
        /*
         * developブランチへのマージ
         * + 許可: master, release/*, hotfix/*
         * + Pull Requestのみ許可: feature/*
         * + 禁止: *
         */
        const allowBranchList = ['master', 'feature/*', 'release/*', 'hotfix/*'];

        if (/^master$|^(release|hotfix)\//.test(merge_branch)) {
          /*
           * 許可: master, release/*, hotfix/*
           */
          allowMerge();
        } else if (/^feature\//.test(merge_branch)) {
          /*
           * Pull Requestのみ許可: feature/*
           */
          pullRequestOnlyMerge(current_branch, merge_branch);
        } else {
          /*
           * 禁止: *
           */
          denyMerge(current_branch, merge_branch, allowBranchList);
        }

      } else if (/^feature\//.test(current_branch)) {
        /*
         * feature/*ブランチへのマージ
         * + 許可: develop
         * + 禁止: master, release/*, hotfix/*
         * + Pull Requestのみ許可: feature/*, *
         */
        const allowBranchList = ['develop', 'feature/*', '*'];

        if (merge_branch === 'develop') {
          /*
           * 許可: develop
           */
          allowMerge();
        } else if (/^master$|^(release|hotfix)\//.test(merge_branch)) {
          /*
           * 禁止: master, release/*, hotfix/*
           */
          denyMerge(current_branch, merge_branch, allowBranchList);
        } else {
          /*
           * Pull Requestのみ許可: feature/*, *
           */
          pullRequestOnlyMerge(current_branch, merge_branch);
        }

      } else if (/^release\//.test(current_branch)) {
        /*
         * release/*ブランチへのマージ
         * + 許可：master, develop
         * + 禁止：feature/*, release/*, hotfix/*, *
         */
        const allowBranchList = ['master', 'develop'];

        if (['master', 'develop'].includes(merge_branch)) {
          /*
           * 許可: master, develop
           */
          allowMerge();
        } else {
          /*
           * 禁止: feature/*, release/*, hotfix/*, *
           */
          denyMerge(current_branch, merge_branch, allowBranchList);
        }

      } else if (/^hotfix\//.test(current_branch)) {
        /*
         * hotfix/*ブランチへのマージ
         * + 許可：master
         * + 禁止：develop, feature/*, release/*, hotfix/*, *
         */
        const allowBranchList = ['master'];

        if (merge_branch === 'master') {
          /*
           * 許可: master
           */
          allowMerge();
        } else {
          /*
           * 禁止: develop, feature/*, release/*, hotfix/*, *
           */
          denyMerge(current_branch, merge_branch, allowBranchList);
        }
      } else {
        /*
         * その他のブランチへのマージ
         */
        allowMerge();
      }
    } catch(e) {}
  })();
}
