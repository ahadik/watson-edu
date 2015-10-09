//
//  KeyboardViewController.swift
//  MathBoard
//
//  Created by Alex Hadik on 10/5/15.
//  Copyright © 2015 Alex Hadik. All rights reserved.
//

import UIKit

class KeyboardViewController: UIInputViewController {
    @IBOutlet var display: UILabel!
    var mathboardView: UIView!
    var shouldClearDisplayBeforeInserting = true
    
    @IBAction func nextKeyboard(sender: UIButton) {
        advanceToNextInputMode()
    }

    override func updateViewConstraints() {
        super.updateViewConstraints()
    
        // Add custom view sizing constraints here
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        loadInterface()
    }

    func loadInterface() {
        // load the nib file
        var mathboardNib = UINib(nibName: "MathBoard", bundle: nil)
        // instantiate the view
        mathboardView = mathboardNib.instantiateWithOwner(self, options: nil)[0] as! UIView
        
        // add the interface to the main view
        view.addSubview(mathboardView)
        
        // copy the background color
        view.backgroundColor = mathboardView.backgroundColor

    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated
    }

    override func textWillChange(textInput: UITextInput?) {
        // The app is about to change the document's contents. Perform any preparation here.
    }

    override func textDidChange(textInput: UITextInput?) {
        // The app has just changed the document's contents, the document context has been updated.
    
        var textColor: UIColor
        let proxy = self.textDocumentProxy
        if proxy.keyboardAppearance == UIKeyboardAppearance.Dark {
            textColor = UIColor.whiteColor()
        } else {
            textColor = UIColor.blackColor()
        }
    }
    
    @IBAction func didBackspace(){
        let proxy = textDocumentProxy as UITextDocumentProxy
        proxy.deleteBackward()
    }
    
    @IBAction func didTapKey(key: UIButton) {
        
        (textDocumentProxy as UIKeyInput).insertText((key.titleLabel?.text)!)

    }
    
    @IBAction func didTapSend(key: UIButton){
        (textDocumentProxy as UIKeyInput).insertText(( "\n" ))
    }
    
    @IBAction func didTapInsert() {
        var proxy = textDocumentProxy as UITextDocumentProxy
        
        if let input = display?.text as String? {
            proxy.insertText(input)
        }
    }

}
