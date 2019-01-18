'use strict';

const fs = require('fs');
const path = require('path');

function indent(str, indent='    ', firstIndent=indent) {
  return str.split(/\r\n?|\n/)
    .map((line, index) => (
      (line !== '') ?
      (index === 0 ? firstIndent : indent) + line :
      ''
    ))
    .join("\n");
}

const [ COMMIT_MSG_FILE, COMMIT_SOURCE, SHA1 ] = (process.env.HUSKY_GIT_PARAMS || process.env.GIT_PARAMS || '').split(' ');
const SCRIPT_PATH = './' + path.relative(process.cwd(), process.argv[1]);
const OUTPUT_PREFIX = `${SCRIPT_PATH} > `;

let exitCode = 0;

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
        console.error(`${OUTPUT_PREFIX}[!] コミットメッセージの解析に失敗しました:\n${indent(commitMsg)}`);
        return;
      }
      const [, merge_branch, current_branch] = match;

      /*
       * ブランチを比較し、マージを許可するか拒否するかを判定する
       */
      let limitation = 'deny';
      let allowBranchList = null;
      let denyBranchList = null;

      if (current_branch === 'master') {
        /*
         * masterブランチへのマージ
         * + Pull Requestのみ許可: release/*, hotfix/*
         * + 禁止: develop, feature/*, *
         */
        allowBranchList = ['release/*', 'hotfix/*'];

        if (/^release\/|^hotfix\//.test(merge_branch)) {
          /*
           * Pull Requestのみ許可: release/*, hotfix/*
           */
          limitation = 'pr-only';
        } else {
          /*
           * 禁止: develop, feature/*, *
           */
          limitation = 'deny';
        }

      } else if (current_branch === 'develop') {
        /*
         * developブランチへのマージ
         * + 許可: master, release/*, hotfix/*
         * + Pull Requestのみ許可: feature/*
         * + 禁止: *
         */
        allowBranchList = ['master', 'feature/*', 'release/*', 'hotfix/*'];

        if (/^master$|^release\/|^hotfix\//.test(merge_branch)) {
          /*
           * 許可: master, release/*, hotfix/*
           */
          limitation = 'allow';
        } else if (/^feature\//.test(merge_branch)) {
          /*
           * Pull Requestのみ許可: feature/*
           */
          limitation = 'pr-only';
        } else {
          /*
           * 禁止: *
           */
          limitation = 'deny';
        }

      } else if (/^feature\//.test(current_branch)) {
        /*
         * feature/*ブランチへのマージ
         * + 許可: develop
         * + 禁止: master, release/*, hotfix/*
         * + Pull Requestのみ許可: feature/*, *
         */
        denyBranchList = ['master', 'release/*', 'hotfix/*'];

        if (merge_branch === 'develop') {
          /*
           * 許可: develop
           */
          limitation = 'allow';
        } else if (/^master$|^release\/|^hotfix\//.test(merge_branch)) {
          /*
           * 禁止: master, release/*, hotfix/*
           */
          limitation = 'deny';
        } else {
          /*
           * Pull Requestのみ許可: feature/*, *
           */
          limitation = 'pr-only';
        }

      } else if (/^release\//.test(current_branch)) {
        /*
         * release/*ブランチへのマージ
         * + 許可：master, develop
         * + 禁止：feature/*, release/*, hotfix/*, *
         */
        allowBranchList = ['master', 'develop'];

        if (/^master$|^develop$/.test(merge_branch)) {
          /*
           * 許可: master, develop
           */
          limitation = 'allow';
        } else {
          /*
           * 禁止: feature/*, release/*, hotfix/*, *
           */
          limitation = 'deny';
        }

      } else if (/^hotfix\//.test(current_branch)) {
        /*
         * hotfix/*ブランチへのマージ
         * + 許可：master
         * + 禁止：develop, feature/*, release/*, hotfix/*, *
         */
        allowBranchList = ['master'];

        if (merge_branch === 'master') {
          /*
           * 許可: master
           */
          limitation = 'allow';
        } else {
          /*
           * 禁止: develop, feature/*, release/*, hotfix/*, *
           */
          limitation = 'deny';
        }
      } else {
        /*
         * その他のブランチへのマージ
         */
        limitation = 'allow';
      }

      /*
       * 判定結果に応じて処理を行う
       */
      if (limitation === 'allow') {
        /*
         * マージを許可
         */
        exitCode = 0;
      } else if (limitation === 'deny') {
        /*
         * マージを拒否
         */
        console.error(indent(
          [
            `${current_branch} ブランチに ${merge_branch} ブランチを`,
            `マージすることは禁止されています。`,
            'git merge --abort コマンドでマージ操作を取り消してください。',
            (
              allowBranchList ? `マージ可能なブランチは ${allowBranchList.join(' ')} ブランチです。` :
              denyBranchList ? `マージ可能なブランチは ${denyBranchList.join(' ')} 以外のブランチです。` :
              null
            ),
          ]
            .filter(line => line !== null)
            .join("\n"),
          ' '.repeat(OUTPUT_PREFIX.length),
          OUTPUT_PREFIX
        ));
      } else if (limitation === 'pr-only') {
        /*
         * マージを拒否（Pull Requestのみ許可）
         */
        console.error(indent([
          `${current_branch} ブランチに ${merge_branch} ブランチを`,
          `ローカルでマージすることは禁止されています。`,
          'git merge --abort コマンドでマージ操作を取り消してください。',
          'マージする場合は、マージ操作の取り消し後、',
          'git push origin HEAD コマンドを実行してリモートにプッシュしてから、',
          'GitHub上でPull Requestを作成してください。',
        ].join("\n"), ' '.repeat(OUTPUT_PREFIX.length), OUTPUT_PREFIX));
      } else {
        console.error(indent([
          '不明なエラーが発生しました',
        ].join("\n"), ' '.repeat(OUTPUT_PREFIX.length), OUTPUT_PREFIX));
        console.log({ current_branch, merge_branch, limitation, allowBranchList, denyBranchList });
        console.log();
      }
    } catch(e) {}
  })();
}

process.on('exit', function() {
  process.exit(exitCode);
});
