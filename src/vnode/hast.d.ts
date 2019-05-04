// Type definitions for non-npm package hast
// Project: https://github.com/syntax-tree/hast
// Definitions by: sounisi5011 <https://github.com/sounisi5011>
// TypeScript Version: 3.4

import { Node, Parent as UnistParent, Literal as UnistLiteral } from 'unist';

export interface Parent extends UnistParent {
    children: (Element | Doctype | Comment | Text)[];
}

export interface Literal extends UnistLiteral {
    value: string;
}

export interface Root extends Parent {
    type: 'root';
}

export interface Element extends Parent {
    type: 'element';
    tagName: string;
    properties?: Properties;
    content?: Root;
    children: (Element | Comment | Text)[];
}

export interface Properties {
    [key: string]: PropertyValue;
}

export type PropertyName = string;

export type PropertyValue = unknown;

export interface Doctype extends Node {
    type: 'doctype';
    name: string;
    public?: string;
    system?: string;
}

export interface Comment extends Literal {
    type: 'comment';
}

export interface Text extends Literal {
    type: 'text';
}
