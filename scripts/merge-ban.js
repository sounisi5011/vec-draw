const fs = require('fs');
const path = require('path');
const consoleMsg = require('./src/console-msg.js');
const indent = require('./src/indent.js');

const [COMMIT_MSG_FILE, COMMIT_SOURCE] = (
  process.env.HUSKY_GIT_PARAMS ||
  process.env.GIT_PARAMS ||
  ''
).split(' ');
const SCRIPT_PATH = `./${path.relative(process.cwd(), process.argv[1])}`;
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

function pullRequestOnlyMerge(currentBranch, mergeBranch) {
  /*
   * マージを拒否（Pull Requestのみ許可）
   */
  // eslint-disable-next-line no-console
  console.error(
    consoleMsg(OUTPUT_PREFIX, [
      `${currentBranch} ブランチに ${mergeBranch} ブランチを`,
      `ローカルでマージすることは禁止されています。`,
      'git merge --abort コマンドでマージ操作を取り消してください。',
      '',
      'マージする場合は、マージ操作の取り消し後、',
      'git push origin HEAD コマンドを実行してリモートにプッシュしてから、',
      'GitHub上でPull Requestを作成してください。',
    ]),
  );
}

function denyMerge(currentBranch, mergeBranch, allowBranchList = []) {
  /*
   * マージを拒否
   */
  const denyBranchList = [
    'master',
    'develop',
    'feature/*',
    'release/*',
    'hotfix/*',
  ].filter(branchName => !allowBranchList.includes(branchName));

  const msgLines = [
    `${currentBranch} ブランチに ${mergeBranch} ブランチを`,
    `マージすることは禁止されています。`,
    'git merge --abort コマンドでマージ操作を取り消してください。',
  ];

  if (allowBranchList.length > 0) {
    msgLines.push(
      !allowBranchList.includes('*')
        ? `\nこのブランチはマージ可能です： ${allowBranchList.join(' ')}`
        : `\nこのブランチはマージ禁止です： ${denyBranchList.join(' ')}`,
    );
  }

  // eslint-disable-next-line no-console
  console.error(consoleMsg(OUTPUT_PREFIX, msgLines));
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
      const match = /^Merge branch '([^ \r\n]+)' into ([^ \r\n]+)$/m.exec(
        commitMsg,
      );
      if (!match) {
        // eslint-disable-next-line no-console
        console.error(
          `${OUTPUT_PREFIX}[!] コミットメッセージの解析に失敗しました:\n${indent(
            commitMsg,
            4,
          )}`,
        );
        return;
      }
      const [, mergeBranch, currentBranch] = match;

      /*
       * ブランチを比較し、マージを許可するか拒否するかを判定する
       */
      if (currentBranch === 'master') {
        /*
         * masterブランチへのマージ
         * + Pull Requestのみ許可: release/*, hotfix/*
         * + 禁止: develop, feature/*, *
         */
        const allowBranchList = ['release/*', 'hotfix/*'];

        if (/^(release|hotfix)\//.test(mergeBranch)) {
          /*
           * Pull Requestのみ許可: release/*, hotfix/*
           */
          pullRequestOnlyMerge(currentBranch, mergeBranch);
        } else {
          /*
           * 禁止: develop, feature/*, *
           */
          denyMerge(currentBranch, mergeBranch, allowBranchList);
        }
      } else if (currentBranch === 'develop') {
        /*
         * developブランチへのマージ
         * + 許可: master, release/*, hotfix/*
         * + Pull Requestのみ許可: feature/*
         * + 禁止: *
         */
        const allowBranchList = [
          'master',
          'feature/*',
          'release/*',
          'hotfix/*',
        ];

        if (/^master$|^(release|hotfix)\//.test(mergeBranch)) {
          /*
           * 許可: master, release/*, hotfix/*
           */
          allowMerge();
        } else if (/^feature\//.test(mergeBranch)) {
          /*
           * Pull Requestのみ許可: feature/*
           */
          pullRequestOnlyMerge(currentBranch, mergeBranch);
        } else {
          /*
           * 禁止: *
           */
          denyMerge(currentBranch, mergeBranch, allowBranchList);
        }
      } else if (/^feature\//.test(currentBranch)) {
        /*
         * feature/*ブランチへのマージ
         * + 許可: develop
         * + 禁止: master, release/*, hotfix/*
         * + Pull Requestのみ許可: feature/*, *
         */
        const allowBranchList = ['develop', 'feature/*', '*'];

        if (mergeBranch === 'develop') {
          /*
           * 許可: develop
           */
          allowMerge();
        } else if (/^master$|^(release|hotfix)\//.test(mergeBranch)) {
          /*
           * 禁止: master, release/*, hotfix/*
           */
          denyMerge(currentBranch, mergeBranch, allowBranchList);
        } else {
          /*
           * Pull Requestのみ許可: feature/*, *
           */
          pullRequestOnlyMerge(currentBranch, mergeBranch);
        }
      } else if (/^release\//.test(currentBranch)) {
        /*
         * release/*ブランチへのマージ
         * + 許可：master, develop
         * + 禁止：feature/*, release/*, hotfix/*, *
         */
        const allowBranchList = ['master', 'develop'];

        if (['master', 'develop'].includes(mergeBranch)) {
          /*
           * 許可: master, develop
           */
          allowMerge();
        } else {
          /*
           * 禁止: feature/*, release/*, hotfix/*, *
           */
          denyMerge(currentBranch, mergeBranch, allowBranchList);
        }
      } else if (/^hotfix\//.test(currentBranch)) {
        /*
         * hotfix/*ブランチへのマージ
         * + 許可：master
         * + 禁止：develop, feature/*, release/*, hotfix/*, *
         */
        const allowBranchList = ['master'];

        if (mergeBranch === 'master') {
          /*
           * 許可: master
           */
          allowMerge();
        } else {
          /*
           * 禁止: develop, feature/*, release/*, hotfix/*, *
           */
          denyMerge(currentBranch, mergeBranch, allowBranchList);
        }
      } else {
        /*
         * その他のブランチへのマージ
         */
        allowMerge();
      }
    } catch (e) {} // eslint-disable-line no-empty
  })();
}
